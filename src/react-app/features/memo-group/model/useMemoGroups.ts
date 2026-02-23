import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useState } from "react";

import { loadGroups, loadListOrder, saveGroups, saveListOrder } from "./storage";
import type { MemoGroup, MemoListItem } from "./types";

interface MemoCardRef {
  id: string;
  groupId?: string;
}

function buildInitialListOrder(cards: MemoCardRef[]): MemoListItem[] {
  return cards.filter((c) => !c.groupId).map((c) => ({ type: "card" as const, id: c.id }));
}

export function useMemoGroups(cards: MemoCardRef[]) {
  const [groups, setGroups] = useState<MemoGroup[]>(loadGroups);
  const [listOrder, setListOrder] = useState<MemoListItem[]>(() => {
    const saved = loadListOrder();
    if (saved) return saved;
    return buildInitialListOrder(cards);
  });

  const addGroup = useCallback((name: string): string => {
    const id = crypto.randomUUID();
    const group: MemoGroup = { id, name, createdAt: Date.now(), isCollapsed: false };
    setGroups((prev) => {
      const next = [...prev, group];
      saveGroups(next);
      return next;
    });
    setListOrder((prev) => {
      const next = [...prev, { type: "group" as const, id }];
      saveListOrder(next);
      return next;
    });
    return id;
  }, []);

  const deleteGroup = useCallback((groupId: string, groupCardIds: string[]) => {
    setGroups((prev) => {
      const next = prev.filter((g) => g.id !== groupId);
      saveGroups(next);
      return next;
    });
    setListOrder((prev) => {
      const groupIndex = prev.findIndex((item) => item.type === "group" && item.id === groupId);
      if (groupIndex === -1) return prev;
      const cardItems: MemoListItem[] = groupCardIds.map((id) => ({ type: "card" as const, id }));
      const next = [...prev.slice(0, groupIndex), ...cardItems, ...prev.slice(groupIndex + 1)];
      saveListOrder(next);
      return next;
    });
  }, []);

  const renameGroup = useCallback((groupId: string, name: string) => {
    setGroups((prev) => {
      const next = prev.map((g) => (g.id === groupId ? { ...g, name } : g));
      saveGroups(next);
      return next;
    });
  }, []);

  const toggleCollapse = useCallback((groupId: string) => {
    setGroups((prev) => {
      const next = prev.map((g) => (g.id === groupId ? { ...g, isCollapsed: !g.isCollapsed } : g));
      saveGroups(next);
      return next;
    });
  }, []);

  const reorderListItems = useCallback((activeId: string, overId: string) => {
    setListOrder((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === activeId);
      const newIndex = prev.findIndex((item) => item.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = arrayMove(prev, oldIndex, newIndex);
      saveListOrder(next);
      return next;
    });
  }, []);

  const addCardToListOrder = useCallback((cardId: string) => {
    setListOrder((prev) => {
      const next = [...prev, { type: "card" as const, id: cardId }];
      saveListOrder(next);
      return next;
    });
  }, []);

  const removeCardFromListOrder = useCallback((cardId: string) => {
    setListOrder((prev) => {
      const next = prev.filter((item) => !(item.type === "card" && item.id === cardId));
      saveListOrder(next);
      return next;
    });
  }, []);

  const syncListOrder = useCallback((newOrder: MemoListItem[]) => {
    setListOrder(newOrder);
    saveListOrder(newOrder);
  }, []);

  return {
    groups,
    listOrder,
    addGroup,
    deleteGroup,
    renameGroup,
    toggleCollapse,
    reorderListItems,
    addCardToListOrder,
    removeCardFromListOrder,
    syncListOrder,
  } as const;
}
