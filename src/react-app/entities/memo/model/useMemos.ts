import { useCallback, useEffect, useState } from "react";
import type { Memo } from "./types";
import { memoStorage } from "../../../shared/lib/storage";
import { generateId, getNextOrder, reorderMemos as reorderMemosUtil } from "../lib/utils";

/**
 * メモの状態管理フック
 */
export function useMemos() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初回マウント時にLocalStorageから読み込み
  useEffect(() => {
    const loaded = memoStorage.load();
    if (loaded) {
      setMemos(loaded.memos);
    }
    setIsLoading(false);
  }, []);

  // 状態変更時にLocalStorageに保存
  useEffect(() => {
    if (!isLoading) {
      memoStorage.save({ memos });
    }
  }, [memos, isLoading]);

  /**
   * メモを追加
   */
  const addMemo = useCallback(
    (content: string) => {
      const newMemo: Memo = {
        id: generateId(),
        content,
        order: getNextOrder(memos),
      };
      setMemos((prev) => [...prev, newMemo]);
    },
    [memos],
  );

  /**
   * メモを更新
   */
  const updateMemo = useCallback((id: string, content: string) => {
    setMemos((prev) => prev.map((memo) => (memo.id === id ? { ...memo, content } : memo)));
  }, []);

  /**
   * メモを削除
   */
  const deleteMemo = useCallback((id: string) => {
    setMemos((prev) => prev.filter((memo) => memo.id !== id));
  }, []);

  /**
   * メモを並び替え
   */
  const reorderMemos = useCallback((oldIndex: number, newIndex: number) => {
    setMemos((prev) => {
      const reordered = [...prev];
      const [removed] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, removed);
      return reorderMemosUtil(reordered);
    });
  }, []);

  /**
   * 全メモをリセット
   */
  const resetMemos = useCallback(() => {
    setMemos([]);
  }, []);

  return {
    memos,
    addMemo,
    updateMemo,
    deleteMemo,
    reorderMemos,
    resetMemos,
    isLoading,
  };
}
