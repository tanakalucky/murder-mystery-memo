import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useState } from "react";

import { loadCollapseState, loadListOrder, saveCollapseState, saveListOrder } from "./storage";
import type { MemoCard, MemoListItem } from "./types";

function buildInitialListOrder(cards: MemoCard[]): MemoListItem[] {
  return cards.filter((c) => !c.parentId).map((c) => ({ type: "card" as const, id: c.id }));
}

export function useMemoListOrder(cards: MemoCard[]) {
  const [listOrder, setListOrder] = useState<MemoListItem[]>(() => {
    const saved = loadListOrder();
    if (saved) return saved;
    return buildInitialListOrder(cards);
  });

  const [collapseState, setCollapseState] = useState<Record<string, boolean>>(loadCollapseState);

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

  const toggleCollapse = useCallback((cardId: string) => {
    setCollapseState((prev) => {
      const next = { ...prev, [cardId]: !prev[cardId] };
      saveCollapseState(next);
      return next;
    });
  }, []);

  const dissolveParent = useCallback((parentId: string, childIds: string[]) => {
    setListOrder((prev) => {
      const parentIndex = prev.findIndex((item) => item.id === parentId);
      if (parentIndex === -1) return prev;
      const childItems: MemoListItem[] = childIds.map((id) => ({
        type: "card" as const,
        id,
      }));
      const next = [...prev.slice(0, parentIndex), ...childItems, ...prev.slice(parentIndex + 1)];
      saveListOrder(next);
      return next;
    });

    setCollapseState((prev) => {
      const { [parentId]: _, ...next } = prev;
      saveCollapseState(next);
      return next;
    });
  }, []);

  return {
    listOrder,
    collapseState,
    reorderListItems,
    addCardToListOrder,
    removeCardFromListOrder,
    syncListOrder,
    toggleCollapse,
    dissolveParent,
  } as const;
}
