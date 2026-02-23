import type { MemoCard, MemoListItem } from "./types";

export const CARDS_KEY = "murder-mystery-memo-cards";
export const LIST_ORDER_KEY = "murder-mystery-memo-list-order";
export const COLLAPSE_STATE_KEY = "murder-mystery-memo-collapse-state";

export function loadCards(): MemoCard[] {
  try {
    const raw = localStorage.getItem(CARDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MemoCard[];
  } catch {
    return [];
  }
}

export function saveCards(cards: MemoCard[]): void {
  localStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

export function loadListOrder(): MemoListItem[] | null {
  try {
    const raw = localStorage.getItem(LIST_ORDER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MemoListItem[];
  } catch {
    return null;
  }
}

export function saveListOrder(order: MemoListItem[]): void {
  localStorage.setItem(LIST_ORDER_KEY, JSON.stringify(order));
}

export function loadCollapseState(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(COLLAPSE_STATE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    return {};
  }
}

export function saveCollapseState(state: Record<string, boolean>): void {
  localStorage.setItem(COLLAPSE_STATE_KEY, JSON.stringify(state));
}
