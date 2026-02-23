import { arrayMove } from "@dnd-kit/sortable";
import { useCallback, useState } from "react";

import { loadCards, saveCards } from "./storage";
import type { MemoCard } from "./types";

export function useMemoCards() {
  const [cards, setCards] = useState<MemoCard[]>(loadCards);

  const addCard = useCallback((body: string): string => {
    const id = crypto.randomUUID();
    const card: MemoCard = { id, body, createdAt: Date.now() };
    setCards((prev) => {
      const next = [...prev, card];
      saveCards(next);
      return next;
    });
    return id;
  }, []);

  const updateCard = useCallback((id: string, body: string) => {
    setCards((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, body } : c));
      saveCards(next);
      return next;
    });
  }, []);

  const deleteCard = useCallback((id: string) => {
    setCards((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveCards(next);
      return next;
    });
  }, []);

  const deleteAllCards = useCallback(() => {
    setCards([]);
    saveCards([]);
  }, []);

  const reorderCards = useCallback((activeId: string, overId: string) => {
    setCards((prev) => {
      const oldIndex = prev.findIndex((c) => c.id === activeId);
      const newIndex = prev.findIndex((c) => c.id === overId);
      if (oldIndex === -1 || newIndex === -1) return prev;
      const next = arrayMove(prev, oldIndex, newIndex);
      saveCards(next);
      return next;
    });
  }, []);

  const moveCardToParent = useCallback((cardId: string, parentId: string | undefined) => {
    setCards((prev) => {
      const next = prev.map((c) => (c.id === cardId ? { ...c, parentId } : c));
      saveCards(next);
      return next;
    });
  }, []);

  const clearChildrenFromParent = useCallback((parentId: string) => {
    setCards((prev) => {
      const next = prev.map((c) => (c.parentId === parentId ? { ...c, parentId: undefined } : c));
      saveCards(next);
      return next;
    });
  }, []);

  return {
    cards,
    addCard,
    updateCard,
    deleteCard,
    deleteAllCards,
    reorderCards,
    moveCardToParent,
    clearChildrenFromParent,
  } as const;
}
