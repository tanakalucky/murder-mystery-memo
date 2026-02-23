import { CARDS_KEY, COLLAPSE_STATE_KEY, LIST_ORDER_KEY } from "./storage";
import type { MemoCard } from "./types";

const MIGRATION_VERSION_KEY = "murder-mystery-memo-migration-version";
const CURRENT_VERSION = 1;

const OLD_GROUPS_KEY = "murder-mystery-memo-groups";

interface OldMemoGroup {
  id: string;
  name: string;
  createdAt: number;
  isCollapsed: boolean;
}

interface OldMemoListItem {
  type: "card" | "group";
  id: string;
}

export function migrateIfNeeded(): void {
  const version = getVersion();
  if (version >= CURRENT_VERSION) return;

  migrateGroupsToParentCards();
  setVersion(CURRENT_VERSION);
}

function getVersion(): number {
  try {
    const raw = localStorage.getItem(MIGRATION_VERSION_KEY);
    if (!raw) return 0;
    return Number(raw);
  } catch {
    return 0;
  }
}

function setVersion(version: number): void {
  localStorage.setItem(MIGRATION_VERSION_KEY, String(version));
}

function migrateGroupsToParentCards(): void {
  const oldGroups = loadOldGroups();
  if (oldGroups.length === 0) return;

  const cards = loadCards();
  const oldListOrder = loadOldListOrder();

  const newCards: MemoCard[] = [];
  const collapseState: Record<string, boolean> = {};

  for (const group of oldGroups) {
    newCards.push({
      id: group.id,
      body: group.name,
      createdAt: group.createdAt,
    });
    collapseState[group.id] = group.isCollapsed;
  }

  const migratedCards: MemoCard[] = cards.map((card) => {
    const { groupId, ...rest } = card;
    if (!groupId) return rest;
    return { ...rest, parentId: groupId };
  });

  const allCards = [...migratedCards, ...newCards];
  localStorage.setItem(CARDS_KEY, JSON.stringify(allCards));

  if (oldListOrder) {
    const newListOrder = oldListOrder.map((item) => ({
      type: "card" as const,
      id: item.id,
    }));
    localStorage.setItem(LIST_ORDER_KEY, JSON.stringify(newListOrder));
  }

  localStorage.setItem(COLLAPSE_STATE_KEY, JSON.stringify(collapseState));

  localStorage.removeItem(OLD_GROUPS_KEY);
}

function loadOldGroups(): OldMemoGroup[] {
  try {
    const raw = localStorage.getItem(OLD_GROUPS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as OldMemoGroup[];
  } catch {
    return [];
  }
}

function loadCards(): Array<{ id: string; body: string; createdAt: number; groupId?: string }> {
  try {
    const raw = localStorage.getItem(CARDS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Array<{
      id: string;
      body: string;
      createdAt: number;
      groupId?: string;
    }>;
  } catch {
    return [];
  }
}

function loadOldListOrder(): OldMemoListItem[] | null {
  try {
    const raw = localStorage.getItem(LIST_ORDER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OldMemoListItem[];
  } catch {
    return null;
  }
}
