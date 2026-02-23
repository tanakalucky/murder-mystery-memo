import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

import type { MemoGroup } from "../model/types";
import { MemoGroupHeader } from "./MemoGroupHeader";

interface MemoGroupCardProps {
  group: MemoGroup;
  cardIds: string[];
  isDropTarget: boolean;
  onToggleCollapse: () => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  children: ReactNode;
}

export function MemoGroupCard({
  group,
  cardIds,
  isDropTarget,
  onToggleCollapse,
  onRename,
  onDelete,
  children,
}: MemoGroupCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
    data: { type: "group", groupId: group.id },
  });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `group-droppable-${group.id}`,
    data: { type: "group-container", groupId: group.id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragHandle = (
    <button
      type="button"
      className="cursor-grab touch-none rounded p-1 text-amber-100/40 hover:text-amber-100/80 active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <GripVertical className="size-4" />
    </button>
  );

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
      <MemoGroupHeader
        name={group.name}
        cardCount={cardIds.length}
        isCollapsed={group.isCollapsed}
        dragHandle={dragHandle}
        onToggleCollapse={onToggleCollapse}
        onRename={onRename}
        onDelete={onDelete}
      />

      {!group.isCollapsed && (
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2 px-3 pb-3">{children}</div>
        </SortableContext>
      )}
    </div>
  );
}
