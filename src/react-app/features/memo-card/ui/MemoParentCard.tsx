import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronRight, GripVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/Button";
import { Textarea } from "@/shared/ui/Textarea";

import type { MemoCard } from "../model/types";

interface MemoParentCardProps {
  card: MemoCard;
  childIds: string[];
  isCollapsed: boolean;
  isDropTarget: boolean;
  onUpdate: (id: string, body: string) => void;
  onDelete: (id: string) => void;
  onToggleCollapse: () => void;
  children: ReactNode;
}

export function MemoParentCard({
  card,
  childIds,
  isCollapsed,
  isDropTarget,
  onUpdate,
  onDelete,
  onToggleCollapse,
  children,
}: MemoParentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "parent", parentId: card.id },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `parent-droppable-${card.id}`,
    data: { type: "parent-container", parentId: card.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      const len = textareaRef.current.value.length;
      textareaRef.current.setSelectionRange(len, len);
    }
  }, [isEditing]);

  return (
    <div
      ref={(node) => {
        setSortableRef(node);
        setDroppableRef(node);
      }}
      style={style}
      className={cn(
        "rounded-lg border-2 border-amber-700/40 bg-linear-to-br from-amber-950/20 to-stone-950/40 shadow-md transition-all",
        isDragging && "z-50 opacity-80 shadow-2xl",
        isDropTarget && "border-amber-500/60 bg-amber-950/30",
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2">
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-amber-100/40 hover:text-amber-100/80 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="shrink-0 text-amber-100/60 hover:text-amber-100/90"
        >
          {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        {isEditing ? (
          <Textarea
            ref={textareaRef}
            defaultValue={card.body}
            placeholder="(無題)"
            className="min-h-8 min-w-0 flex-1 resize-none border-amber-900/20 bg-transparent py-0.5 font-serif text-sm text-amber-100/90 placeholder:text-amber-100/30 focus-visible:border-amber-700/50 focus-visible:ring-amber-700/20"
            onBlur={(e) => {
              onUpdate(card.id, e.currentTarget.value);
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onUpdate(card.id, e.currentTarget.value);
                setIsEditing(false);
              }
            }}
          />
        ) : (
          <button
            type="button"
            className="min-w-0 flex-1 cursor-text truncate text-left font-serif text-sm font-semibold text-amber-100/90"
            onClick={() => setIsEditing(true)}
          >
            {card.body || <span className="text-amber-100/30 italic">(無題)</span>}
          </button>
        )}

        <span className="shrink-0 rounded-full bg-amber-900/30 px-2 py-0.5 font-sans text-xs text-amber-100/60">
          {childIds.length}
        </span>

        <Button
          variant="ghost"
          size="icon-xs"
          className="shrink-0 text-amber-100/40 hover:text-red-400"
          onClick={() => onDelete(card.id)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      {!isCollapsed && (
        <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 px-3 pb-3">{children}</div>
        </SortableContext>
      )}
    </div>
  );
}
