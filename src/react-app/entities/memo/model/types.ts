/**
 * メモアイテムの型定義
 */
export type Memo = {
  /** 一意なID（UUID v4） */
  id: string;
  /** メモの内容 */
  content: string;
  /** 並び順（0始まり、小さいほど上） */
  order: number;
};

/**
 * メモリスト全体の型定義
 */
export type MemoList = {
  memos: Memo[];
};

/**
 * メモの作成パラメータ
 */
export type CreateMemoParams = {
  content: string;
};

/**
 * メモの更新パラメータ
 */
export type UpdateMemoParams = {
  id: string;
  content: string;
};
