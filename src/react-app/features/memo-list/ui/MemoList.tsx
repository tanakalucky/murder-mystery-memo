import type { Memo } from "../../../entities/memo";
import { MemoItem } from "../../../entities/memo";

type MemoListProps = {
  memos: Memo[];
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onReorder: (oldIndex: number, newIndex: number) => void;
};

/**
 * メモ一覧コンポーネント
 */
export function MemoList({ memos, onUpdate, onDelete, onReorder }: MemoListProps) {
  return (
    <div className="space-y-2">
      {memos.map((memo) => (
        <MemoItem key={memo.id} memo={memo} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}
