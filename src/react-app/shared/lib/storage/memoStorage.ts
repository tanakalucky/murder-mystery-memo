import type { MemoList } from "../../../entities/memo";

const STORAGE_KEY = "murder-mystery-memos";

/**
 * LocalStorageユーティリティ
 * メモリストの保存・読み込み・クリアを管理
 */
export const memoStorage = {
  /**
   * メモリストを保存
   */
  save: (memoList: MemoList): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memoList));
    } catch (error) {
      console.error("Failed to save memos to localStorage:", error);
    }
  },

  /**
   * メモリストを読み込み
   * @returns MemoList | null - パース失敗時はnullを返す
   */
  load: (): MemoList | null => {
    try {
      const json = localStorage.getItem(STORAGE_KEY);
      if (!json) {
        return null;
      }
      return JSON.parse(json) as MemoList;
    } catch (error) {
      console.error("Failed to load memos from localStorage:", error);
      return null;
    }
  },

  /**
   * メモリストをクリア
   */
  clear: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear memos from localStorage:", error);
    }
  },
};
