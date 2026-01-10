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
      className="px-4 py-3 rounded-lg cursor-move transition-all duration-300 hover:translate-y-[-2px] group"
      style={{
        backgroundColor: "var(--color-bg-tertiary)",
        border: "1px solid var(--color-border)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-bg-hover)";
        e.currentTarget.style.borderColor = "var(--color-accent-primary)";
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "var(--color-bg-tertiary)";
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
      }}
    >
      <div className="flex items-center justify-between gap-3">
        {isEditing ? (
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleSave}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            className="flex-1 px-3 py-2 rounded-md focus:outline-none transition-all duration-200"
            style={{
              backgroundColor: "var(--color-bg-primary)",
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-body)",
              border: "2px solid var(--color-accent-primary)",
              boxShadow: "0 0 0 3px rgba(196, 30, 58, 0.1)",
            }}
            autoFocus
          />
        ) : (
          <p
            className="flex-1 whitespace-pre-wrap break-words cursor-pointer"
            style={{
              color: "var(--color-text-primary)",
              fontFamily: "var(--font-body)",
              fontSize: "0.9rem",
              lineHeight: "1.5",
            }}
            onDoubleClick={handleDoubleClick}
          >
            {memo.content}
          </p>
        )}
        <button
          onClick={handleDelete}
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 opacity-0 group-hover:opacity-100"
          style={{
            color: "var(--color-danger)",
            fontSize: "1.4rem",
            fontWeight: "bold",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-danger)";
            e.currentTarget.style.color = "var(--color-text-primary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "var(--color-danger)";
          }}
          aria-label="削除"
        >
          ×
        </button>
      </div>
    </div>
  );
}
