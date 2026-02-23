export interface MemoCard {
  id: string;
  body: string;
  createdAt: number;
  parentId?: string;
}

export type MemoListItem = { type: "card"; id: string };
