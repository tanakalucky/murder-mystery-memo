import type { ChatMessage } from '@/features/memo/types';
import type { TimelineEntry } from '@/features/timeline/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type React from 'react';
import { createContext, useContext } from 'react';

interface AppContextValue {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  timeline: TimelineEntry[];
  setTimeline: React.Dispatch<React.SetStateAction<TimelineEntry[]>>;
  currentDay: number;
  setCurrentDay: (day: number) => void;
  addMessage: (content: string) => void;
  editMessage: (id: string, newContent: string) => void;
  startEditingMessage: (id: string) => void;
  editTimelineEntry: (id: string, newContent: string) => void;
  startEditingTimelineEntry: (id: string) => void;
  clearHistory: () => void;
  clearTimeline: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>(
    'murderMystery_messages',
    [],
    (data) =>
      data.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
  );

  const [timeline, setTimeline] = useLocalStorage<TimelineEntry[]>(
    'murderMystery_timeline',
    [],
    (data) =>
      data.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp),
      })),
  );

  const [currentDay, setCurrentDay] = useLocalStorage<number>(
    'murderMystery_currentDay',
    1,
  );

  const addMessage = (content: string) => {
    if (content.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        content: content.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);
    }
  };

  const editMessage = (id: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, content: newContent, isEditing: false } : msg,
      ),
    );
  };

  const startEditingMessage = (id: string) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, isEditing: true } : msg)),
    );
  };

  const editTimelineEntry = (id: string, newContent: string) => {
    setTimeline((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, content: newContent, isEditing: false }
          : entry,
      ),
    );
  };

  const startEditingTimelineEntry = (id: string) => {
    setTimeline((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, isEditing: true } : entry,
      ),
    );
  };

  const handleSetCurrentDay = (newDay: number) => {
    const validDay = Math.max(1, newDay);

    // 日数が減少した場合、表示されなくなる日のメモをメモリストに戻す
    if (validDay < currentDay) {
      const entriesToRemove = timeline.filter((entry) => entry.day > validDay);
      if (entriesToRemove.length > 0) {
        const messagesToAdd = entriesToRemove.map((entry) => ({
          id: entry.id,
          content: entry.content,
          timestamp: entry.timestamp,
        }));
        setMessages((prev) => [...prev, ...messagesToAdd]);
        setTimeline((prev) => prev.filter((entry) => entry.day <= validDay));
      }
    }

    setCurrentDay(validDay);
  };

  const clearHistory = () => {
    setMessages([]);
    setTimeline([]);
  };

  const clearTimeline = () => {
    const timelineMessages = timeline.map((entry) => ({
      id: entry.id,
      content: entry.content,
      timestamp: entry.timestamp,
    }));
    setMessages((prev) => [...prev, ...timelineMessages]);
    setTimeline([]);
  };

  return (
    <AppContext.Provider
      value={{
        messages,
        setMessages,
        timeline,
        setTimeline,
        currentDay,
        setCurrentDay: handleSetCurrentDay,
        addMessage,
        editMessage,
        startEditingMessage,
        editTimelineEntry,
        startEditingTimelineEntry,
        clearHistory,
        clearTimeline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
