import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/Button";
import { Textarea } from "@/shared/ui/Textarea";

import type { MemoCard as MemoCardType } from "../model/types";

interface MemoCardProps {
  card: MemoCardType;
  onUpdate: (id: string, body: string) => void;
  onDelete: (id: string) => void;
}

export function MemoCard({ card, onUpdate, onDelete }: MemoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
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
      ref={setNodeRef}
      style={style}
      className={cn(
        "memo-card group relative rounded-lg border border-amber-900/30 bg-linear-to-br from-amber-950/40 to-stone-950/60 p-4 font-serif shadow-md transition-shadow hover:shadow-lg",
        isDragging && "z-50 opacity-80 shadow-2xl",
      )}
    >
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          className="cursor-grab touch-none rounded p-1 text-amber-100/40 hover:text-amber-100/80 active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <Button
          variant="ghost"
          size="icon-xs"
          className="text-amber-100/40 hover:text-red-400"
          onClick={() => onDelete(card.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {isEditing ? (
        <Textarea
          ref={textareaRef}
          defaultValue={card.body}
          placeholder="手がかりを記入..."
          className="min-h-20 resize-none border-amber-900/20 bg-transparent font-serif text-amber-100/90 placeholder:text-amber-100/30 focus-visible:border-amber-700/50 focus-visible:ring-amber-700/20"
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
          className="w-full cursor-text text-left"
          onClick={() => setIsEditing(true)}
        >
          {card.body ? (
            <p className="text-sm whitespace-pre-wrap text-amber-100/90">{card.body}</p>
          ) : (
            <p className="text-sm text-amber-100/30 italic">クリックして手がかりを記入...</p>
          )}
        </button>
      )}
    </div>
  );
}
