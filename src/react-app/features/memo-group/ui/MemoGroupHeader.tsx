import { ChevronDown, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "@/shared/ui/Button";

interface MemoGroupHeaderProps {
  name: string;
  cardCount: number;
  isCollapsed: boolean;
  dragHandle: ReactNode;
  onToggleCollapse: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
}

export function MemoGroupHeader({
  name,
  cardCount,
  isCollapsed,
  dragHandle,
  onToggleCollapse,
  onRename,
  onDelete,
}: MemoGroupHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleFinishEdit = () => {
    if (!isEditing) return;
    const value = inputRef.current?.value.trim();
    if (value) {
      onRename(value);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2">
      {dragHandle}

      <button
        type="button"
        onClick={onToggleCollapse}
        className="shrink-0 text-amber-100/60 hover:text-amber-100/90"
      >
        {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          defaultValue={name}
          className="min-w-0 flex-1 rounded border border-amber-700/50 bg-transparent px-2 py-0.5 font-serif text-sm text-amber-100/90 outline-none focus:border-amber-600/70"
          onBlur={handleFinishEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) handleFinishEdit();
            if (e.key === "Escape") setIsEditing(false);
          }}
        />
      ) : (
        <button
          type="button"
          className="min-w-0 flex-1 truncate text-left font-serif text-sm font-semibold text-amber-100/90"
          onClick={onToggleCollapse}
        >
          {name}
        </button>
      )}

      <span className="shrink-0 rounded-full bg-amber-900/30 px-2 py-0.5 font-sans text-xs text-amber-100/60">
        {cardCount}
      </span>

      <div className="flex shrink-0 gap-1">
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-amber-100/40 hover:text-amber-100/80"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-amber-100/40 hover:text-red-400"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
