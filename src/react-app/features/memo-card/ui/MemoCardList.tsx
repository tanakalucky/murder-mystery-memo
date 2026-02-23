import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { MemoCard as MemoCardType } from "../model/types";
import { MemoCard } from "./MemoCard";

interface MemoCardListProps {
  cards: MemoCardType[];
  onUpdate: (id: string, body: string) => void;
  onDelete: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
}

export function MemoCardList({ cards, onUpdate, onDelete, onReorder }: MemoCardListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 font-serif text-amber-100/30">
        <p className="text-lg">まだメモがありません</p>
        <p className="mt-1 text-sm">下の入力欄から手がかりを記録しましょう</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {cards.map((card) => (
            <MemoCard key={card.id} card={card} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
