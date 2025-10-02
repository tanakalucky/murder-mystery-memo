import { useApp } from '@/contexts/AppContext';
import type { ChatMessage } from '@/features/memo/types';
import type { TimelineEntry } from '@/features/timeline/types';
import type React from 'react';
import { createContext, useContext, useState } from 'react';

interface DndContextValue {
  draggedItem: ChatMessage | TimelineEntry | null;
  dragOverSlot: { day: number; hour: number } | null;
  startDrag: (item: ChatMessage | TimelineEntry) => void;
  endDrag: () => void;
  setDragOverSlot: (slot: { day: number; hour: number } | null) => void;
  handleDrop: (day: number, hour: number) => void;
}

const DndContext = createContext<DndContextValue | undefined>(undefined);

// Type guard to check if an item is a TimelineEntry
function isTimelineEntry(item: ChatMessage | TimelineEntry): item is TimelineEntry {
  return 'day' in item && 'hour' in item;
}

export function DndProvider({ children }: { children: React.ReactNode }) {
  const { setMessages, setTimeline } = useApp();
  const [draggedItem, setDraggedItem] = useState<ChatMessage | TimelineEntry | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{
    day: number;
    hour: number;
  } | null>(null);

  const startDrag = (item: ChatMessage | TimelineEntry) => {
    setDraggedItem(item);
  };

  const endDrag = () => {
    setDraggedItem(null);
    setDragOverSlot(null);
  };

  const handleDrop = (day: number, hour: number) => {
    if (draggedItem) {
      if (isTimelineEntry(draggedItem)) {
        // Moving an existing timeline entry to a new time slot
        setTimeline((prev) =>
          prev.map((entry) =>
            entry.id === draggedItem.id
              ? { ...entry, day, hour }
              : entry
          )
        );
      } else {
        // Moving a chat message to the timeline
        const timelineEntry: TimelineEntry = {
          ...draggedItem,
          day,
          hour,
        };
        setTimeline((prev) => [...prev, timelineEntry]);
        setMessages((prev) => prev.filter((msg) => msg.id !== draggedItem.id));
      }
      endDrag();
    }
  };

  return (
    <DndContext.Provider
      value={{
        draggedItem,
        dragOverSlot,
        startDrag,
        endDrag,
        setDragOverSlot,
        handleDrop,
      }}
    >
      {children}
    </DndContext.Provider>
  );
}

export function useDnd() {
  const context = useContext(DndContext);
  if (!context) {
    throw new Error('useDnd must be used within DndProvider');
  }
  return context;
}
