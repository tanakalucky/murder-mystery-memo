import { useState } from "react";
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
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(memo.content);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditContent(memo.content);
  };

  return (
    <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-accent)] rounded hover:bg-[var(--color-bg-hover)] transition-colors">
      <div className="flex items-center justify-between gap-2">
        {isEditing ? (
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="flex-1 px-2 py-1 bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] border border-[var(--color-accent)] rounded focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            autoFocus
          />
        ) : (
          <p
            className="flex-1 text-[var(--color-text-primary)] whitespace-pre-wrap break-words cursor-pointer"
            onDoubleClick={handleDoubleClick}
          >
            {memo.content}
          </p>
        )}
      </div>
    </div>
  );
}
