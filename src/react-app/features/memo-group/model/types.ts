export interface MemoGroup {
  id: string;
  name: string;
  createdAt: number;
  isCollapsed: boolean;
}

export type MemoListItem = { type: "card"; id: string } | { type: "group"; id: string };
