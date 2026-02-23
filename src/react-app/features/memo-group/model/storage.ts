import type { MemoGroup, MemoListItem } from "./types";

const GROUPS_KEY = "murder-mystery-memo-groups";
const LIST_ORDER_KEY = "murder-mystery-memo-list-order";

export function loadGroups(): MemoGroup[] {
  try {
    const raw = localStorage.getItem(GROUPS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as MemoGroup[];
  } catch {
    return [];
  }
}

export function saveGroups(groups: MemoGroup[]): void {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
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
