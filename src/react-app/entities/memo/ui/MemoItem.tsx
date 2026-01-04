import type { Memo } from "../model/types";

type MemoItemProps = {
  memo: Memo;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
};

/**
 * メモアイテムコンポーネント
 */
export function MemoItem({ memo, onUpdate, onDelete }: MemoItemProps) {
  return (
    <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-accent)] rounded hover:bg-[var(--color-bg-hover)] transition-colors">
      <div className="flex items-center justify-between gap-2">
        <p className="flex-1 text-[var(--color-text-primary)] whitespace-pre-wrap break-words">
          {memo.content}
        </p>
      </div>
    </div>
  );
}
