import type { MemoCard } from "./types";

const STORAGE_KEY = "murder-mystery-memo-cards";

export function loadCards(): MemoCard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MemoCard[];
  } catch {
    return [];
  }
}

export function saveCards(cards: MemoCard[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}
