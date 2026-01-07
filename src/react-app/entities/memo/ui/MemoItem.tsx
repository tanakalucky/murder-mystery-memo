import { useState } from "react";
import type { Memo } from "../model/types";

type MemoItemProps = {
  memo: Memo;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
};

export function MemoItem({ memo, onUpdate, onDelete }: MemoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(memo.content);
  const [isComposing, setIsComposing] = useState(false);

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditContent(memo.content);
  };

  const handleSave = () => {
    const trimmedContent = editContent.trim();
    if (trimmedContent && trimmedContent !== memo.content) {
      onUpdate(memo.id, trimmedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(memo.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isComposing) {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleDelete = () => {
    onDelete(memo.id);
  };

  return (
    <div
      className="p-4 bg-bg-secondary border border-accent rounded-lg hover:bg-bg-hover transition-all duration-200 cursor-move"
      style={{
        boxShadow: "0 2px 8px rgba(212, 175, 55, 0.15), inset 0 1px 0 rgba(212, 175, 55, 0.1)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        {isEditing ? (
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            className="flex-1 px-3 py-2 bg-bg-primary text-text-primary border border-accent rounded focus:outline-none focus:ring-2 focus:ring-accent"
            style={{
              boxShadow: "0 0 10px rgba(212, 175, 55, 0.2)",
            }}
            autoFocus
          />
        ) : (
          <p
            className="flex-1 text-text-primary whitespace-pre-wrap wrap-break-word cursor-pointer"
            onDoubleClick={handleDoubleClick}
          >
            {memo.content}
          </p>
        )}
        <button
          onClick={handleDelete}
          className="shrink-0 w-8 h-8 flex items-center justify-center text-danger hover:text-text-primary hover:bg-danger rounded transition-all duration-200 text-xl font-bold"
          style={{
            textShadow: "0 0 5px rgba(139, 21, 56, 0.3)",
          }}
          aria-label="削除"
        >
          ×
        </button>
      </div>
    </div>
  );
}
