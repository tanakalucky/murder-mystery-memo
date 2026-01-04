import type { Memo } from "../model/types";

/**
 * UUID v4を生成
 * @returns UUID文字列
 */
export const generateId = (): string => {
  return crypto.randomUUID();
};

/**
 * メモリストから次のorder値を計算
 * @param memos - 既存のメモリスト
 * @returns 次のorder値
 */
export const getNextOrder = (memos: Memo[]): number => {
  if (memos.length === 0) {
    return 0;
  }
  const maxOrder = Math.max(...memos.map((m) => m.order));
  return maxOrder + 1;
};

/**
 * メモリストのorderを0から振り直す
 * @param memos - メモリスト
 * @returns orderを振り直したメモリスト
 */
export const reorderMemos = (memos: Memo[]): Memo[] => {
  return memos.map((memo, index) => ({
    ...memo,
    order: index,
  }));
};
