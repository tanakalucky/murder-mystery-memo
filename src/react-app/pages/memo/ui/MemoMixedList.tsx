import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMemo, useRef, useState } from "react";

import { MemoCard, type MemoCardType } from "@/features/memo-card";
import { MemoGroupCard, type MemoGroup, type MemoListItem } from "@/features/memo-group";

interface MemoMixedListProps {
  cards: MemoCardType[];
  groups: MemoGroup[];
  listOrder: MemoListItem[];
  onUpdateCard: (id: string, body: string) => void;
  onDeleteCard: (id: string) => void;
  onMoveCardToGroup: (cardId: string, groupId: string | undefined) => void;
  onReorderListItems: (activeId: string, overId: string) => void;
  onReorderCards: (activeId: string, overId: string) => void;
  onToggleCollapse: (groupId: string) => void;
  onRenameGroup: (groupId: string, name: string) => void;
  onDeleteGroup: (groupId: string, cardIds: string[]) => void;
  onSyncListOrder: (order: MemoListItem[]) => void;
}

const ROOT_CONTAINER = "root";

function findContainer(cardId: string, cards: MemoCardType[]): string {
  const card = cards.find((c) => c.id === cardId);
  if (card?.groupId) return card.groupId;
  return ROOT_CONTAINER;
}

const customCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  return rectIntersection(args);
};

export function MemoMixedList({
  cards,
  groups,
  listOrder,
  onUpdateCard,
  onDeleteCard,
  onMoveCardToGroup,
  onReorderListItems,
  onReorderCards,
  onToggleCollapse,
  onRenameGroup,
  onDeleteGroup,
  onSyncListOrder,
}: MemoMixedListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overGroupId, setOverGroupId] = useState<string | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const cardsMap = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);
  const groupsMap = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups]);

  const groupCardsMap = useMemo(() => {
    const map = new Map<string, MemoCardType[]>();
    for (const card of cards) {
      if (card.groupId) {
        const existing = map.get(card.groupId);
        if (existing) {
          existing.push(card);
        } else {
          map.set(card.groupId, [card]);
        }
      }
    }
    return map;
  }, [cards]);

  const topLevelItemIds = listOrder.map((item) => item.id);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      setOverGroupId(null);
      return;
    }

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    // Check if active is a group - groups cannot be moved into other groups
    const isActiveGroup = groups.some((g) => g.id === activeIdStr);
    if (isActiveGroup) {
      setOverGroupId(null);
      return;
    }

    const overData = over.data.current;

    // Determine the target container
    let targetContainer: string = ROOT_CONTAINER;

    if (overData?.type === "group-container") {
      // Dropping directly onto a group droppable area
      targetContainer = overData.groupId as string;
    } else if (overData?.type === "group") {
      // Dropping onto a group's sortable wrapper
      targetContainer = overData.groupId as string;
    } else {
      // Over a card or root area - check if the card is in a group
      const overCard = cardsMap.get(overIdStr);
      if (overCard?.groupId) {
        targetContainer = overCard.groupId;
      }
    }

    const activeContainer = findContainer(activeIdStr, cards);

    if (targetContainer !== ROOT_CONTAINER) {
      setOverGroupId(targetContainer);
    } else {
      setOverGroupId(null);
    }

    // If containers are different, move the card
    if (activeContainer !== targetContainer) {
      recentlyMovedToNewContainer.current = true;

      if (targetContainer === ROOT_CONTAINER) {
        // Moving out of a group to root
        onMoveCardToGroup(activeIdStr, undefined);
        // Add card to listOrder at the position of the over item
        const overIndex = listOrder.findIndex((item) => item.id === overIdStr);
        const newOrder = [...listOrder];
        const insertIndex = overIndex === -1 ? newOrder.length : overIndex;
        newOrder.splice(insertIndex, 0, { type: "card", id: activeIdStr });
        onSyncListOrder(newOrder);
      } else {
        // Moving into a group
        onMoveCardToGroup(activeIdStr, targetContainer);
        // Remove card from listOrder if it was at root
        if (activeContainer === ROOT_CONTAINER) {
          const newOrder = listOrder.filter(
            (item) => !(item.type === "card" && item.id === activeIdStr),
          );
          onSyncListOrder(newOrder);
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverGroupId(null);
    recentlyMovedToNewContainer.current = false;

    if (!over || active.id === over.id) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    // Check if it's a top-level reorder
    const activeInTopLevel = listOrder.some((item) => item.id === activeIdStr);
    const overInTopLevel = listOrder.some((item) => item.id === overIdStr);

    if (activeInTopLevel && overInTopLevel) {
      onReorderListItems(activeIdStr, overIdStr);
      return;
    }

    // Check if it's a within-group reorder
    const activeContainer = findContainer(activeIdStr, cards);
    const overContainer = findContainer(overIdStr, cards);

    if (activeContainer === overContainer && activeContainer !== ROOT_CONTAINER) {
      onReorderCards(activeIdStr, overIdStr);
    }
  };

  const activeCard = activeId ? cardsMap.get(activeId) : null;
  const activeGroup = activeId ? groupsMap.get(activeId) : null;

  const hasItems = cards.length > 0 || groups.length > 0;

  if (!hasItems) {
    return (
      <div className="flex flex-col items-center justify-center py-16 font-serif text-amber-100/30">
        <p className="text-lg">まだメモがありません</p>
        <p className="mt-1 text-sm">下の入力欄から手がかりを記録しましょう</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={topLevelItemIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {listOrder.map((item) => {
            if (item.type === "card") {
              const card = cardsMap.get(item.id);
              if (!card) return null;
              return (
                <MemoCard
                  key={card.id}
                  card={card}
                  onUpdate={onUpdateCard}
                  onDelete={onDeleteCard}
                />
              );
            }

            const group = groupsMap.get(item.id);
            if (!group) return null;
            const groupCards = groupCardsMap.get(group.id) ?? [];
            const groupCardIds = groupCards.map((c) => c.id);

            return (
              <MemoGroupCard
                key={group.id}
                group={group}
                cardIds={groupCardIds}
                isDropTarget={overGroupId === group.id}
                onToggleCollapse={() => onToggleCollapse(group.id)}
                onRename={(name) => onRenameGroup(group.id, name)}
                onDelete={() => onDeleteGroup(group.id, groupCardIds)}
              >
                {groupCards.map((card) => (
                  <MemoCard
                    key={card.id}
                    card={card}
                    onUpdate={onUpdateCard}
                    onDelete={onDeleteCard}
                  />
                ))}
              </MemoGroupCard>
            );
          })}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeCard ? (
          <div className="rounded-lg border border-amber-900/30 bg-linear-to-br from-amber-950/40 to-stone-950/60 p-4 font-serif shadow-2xl">
            <p className="text-sm whitespace-pre-wrap text-amber-100/90">{activeCard.body}</p>
          </div>
        ) : null}
        {activeGroup ? (
          <div className="rounded-lg border-2 border-amber-700/40 bg-linear-to-br from-amber-950/20 to-stone-950/40 px-3 py-2 shadow-2xl">
            <span className="font-serif text-sm font-semibold text-amber-100/90">
              {activeGroup.name}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
