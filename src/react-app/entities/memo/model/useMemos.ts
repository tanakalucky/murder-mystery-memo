import { useEffect, useState } from "react";
import type { Memo } from "./types";
import { memoStorage } from "../../../shared/lib/storage";

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

  // 以降のサブタスクで機能を追加

  return {
    memos,
    isLoading,
  };
}
