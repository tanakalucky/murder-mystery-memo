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

import {
  MemoCard,
  MemoParentCard,
  type MemoCardType,
  type MemoListItem,
} from "@/features/memo-card";

interface MemoMixedListProps {
  cards: MemoCardType[];
  listOrder: MemoListItem[];
  collapseState: Record<string, boolean>;
  onUpdateCard: (id: string, body: string) => void;
  onDeleteCard: (id: string) => void;
  onMoveCardToParent: (cardId: string, parentId: string | undefined) => void;
  onReorderListItems: (activeId: string, overId: string) => void;
  onReorderCards: (activeId: string, overId: string) => void;
  onToggleCollapse: (cardId: string) => void;
  onSyncListOrder: (order: MemoListItem[]) => void;
}

const ROOT_CONTAINER = "root";

function findContainer(cardId: string, cards: MemoCardType[]): string {
  const card = cards.find((c) => c.id === cardId);
  if (card?.parentId) return card.parentId;
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
  listOrder,
  collapseState,
  onUpdateCard,
  onDeleteCard,
  onMoveCardToParent,
  onReorderListItems,
  onReorderCards,
  onToggleCollapse,
  onSyncListOrder,
}: MemoMixedListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overParentId, setOverParentId] = useState<string | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const cardsMap = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);

  const childCardsMap = useMemo(() => {
    const map = new Map<string, MemoCardType[]>();
    for (const card of cards) {
      if (card.parentId) {
        const existing = map.get(card.parentId);
        if (existing) {
          existing.push(card);
        } else {
          map.set(card.parentId, [card]);
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
      setOverParentId(null);
      return;
    }

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    if (activeIdStr === overIdStr) return;

    // 親カード（子を持つ）はドロップ先として他の親に入れない
    const activeHasChildren = childCardsMap.has(activeIdStr);
    if (activeHasChildren) {
      setOverParentId(null);
      return;
    }

    const overData = over.data.current;

    let targetContainer: string = ROOT_CONTAINER;

    if (overData?.type === "parent-container") {
      // MemoParentCardのドロップゾーン
      targetContainer = overData.parentId as string;
    } else if (overData?.type === "parent") {
      // MemoParentCardのソータブル
      targetContainer = overData.parentId as string;
    } else {
      const overCard = cardsMap.get(overIdStr);
      if (overCard?.parentId) {
        // 子カードの上 → 親にリダイレクト
        targetContainer = overCard.parentId;
      } else if (overCard && !overCard.parentId) {
        // ルートレベルの通常カードの上 → そのカードを親にする
        targetContainer = overIdStr;
      }
    }

    // 自分自身を親にはできない
    if (targetContainer === activeIdStr) {
      setOverParentId(null);
      return;
    }

    const activeContainer = findContainer(activeIdStr, cards);

    if (targetContainer !== ROOT_CONTAINER) {
      setOverParentId(targetContainer);
    } else {
      setOverParentId(null);
    }

    if (activeContainer !== targetContainer) {
      recentlyMovedToNewContainer.current = true;

      if (targetContainer === ROOT_CONTAINER) {
        // 親から外してルートへ
        onMoveCardToParent(activeIdStr, undefined);
        const overIndex = listOrder.findIndex((item) => item.id === overIdStr);
        const newOrder = [...listOrder];
        const insertIndex = overIndex === -1 ? newOrder.length : overIndex;
        newOrder.splice(insertIndex, 0, { type: "card", id: activeIdStr });
        onSyncListOrder(newOrder);
      } else {
        // 親に入れる
        onMoveCardToParent(activeIdStr, targetContainer);
        if (activeContainer === ROOT_CONTAINER) {
          const newOrder = listOrder.filter(
            (item) => !(item.type === "card" && item.id === activeIdStr),
          );
          onSyncListOrder(newOrder);
        }

        // 折りたたまれている親にドロップした場合、展開する
        if (collapseState[targetContainer]) {
          onToggleCollapse(targetContainer);
        }
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverParentId(null);
    recentlyMovedToNewContainer.current = false;

    if (!over || active.id === over.id) return;

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    const activeInTopLevel = listOrder.some((item) => item.id === activeIdStr);
    const overInTopLevel = listOrder.some((item) => item.id === overIdStr);

    if (activeInTopLevel && overInTopLevel) {
      onReorderListItems(activeIdStr, overIdStr);
      return;
    }

    const activeContainer = findContainer(activeIdStr, cards);
    const overContainer = findContainer(overIdStr, cards);

    if (activeContainer === overContainer && activeContainer !== ROOT_CONTAINER) {
      onReorderCards(activeIdStr, overIdStr);
    }
  };

  const activeCard = activeId ? cardsMap.get(activeId) : null;

  if (cards.length === 0) {
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
            const card = cardsMap.get(item.id);
            if (!card) return null;

            const childCards = childCardsMap.get(card.id);

            if (childCards && childCards.length > 0) {
              const childIds = childCards.map((c) => c.id);
              return (
                <MemoParentCard
                  key={card.id}
                  card={card}
                  childIds={childIds}
                  isCollapsed={collapseState[card.id] ?? false}
                  isDropTarget={overParentId === card.id}
                  onUpdate={onUpdateCard}
                  onDelete={onDeleteCard}
                  onToggleCollapse={() => onToggleCollapse(card.id)}
                >
                  {childCards.map((child) => (
                    <MemoCard
                      key={child.id}
                      card={child}
                      onUpdate={onUpdateCard}
                      onDelete={onDeleteCard}
                    />
                  ))}
                </MemoParentCard>
              );
            }

            return (
              <MemoCard key={card.id} card={card} onUpdate={onUpdateCard} onDelete={onDeleteCard} />
            );
          })}
        </div>
      </SortableContext>

      <DragOverlay>
        {activeCard ? (
          <div className="rounded-lg border border-amber-900/30 bg-linear-to-br from-amber-950/40 to-stone-950/60 p-4 font-serif shadow-2xl">
            <p className="text-sm whitespace-pre-wrap text-amber-100/90">
              {activeCard.body || "(無題)"}
            </p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
