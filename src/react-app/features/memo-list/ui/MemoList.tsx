import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Memo } from "../../../entities/memo";
import { MemoItem } from "../../../entities/memo";

type MemoListProps = {
  memos: Memo[];
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
};

type SortableMemoItemProps = {
  memo: Memo;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
};

/**
 * ドラッグ可能なメモアイテムコンポーネント
 */
function SortableMemoItem({ memo, onUpdate, onDelete }: SortableMemoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: memo.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <MemoItem memo={memo} onUpdate={onUpdate} onDelete={onDelete} />
    </div>
  );
}

/**
 * メモ一覧コンポーネント
 */
export function MemoList({ memos, onUpdate, onDelete, onReorder }: MemoListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = memos.findIndex((memo) => memo.id === active.id);
      const newIndex = memos.findIndex((memo) => memo.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={memos.map((memo) => memo.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {memos.map((memo) => (
            <SortableMemoItem key={memo.id} memo={memo} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
