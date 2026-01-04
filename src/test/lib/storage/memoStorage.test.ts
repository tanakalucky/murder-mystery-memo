import { beforeEach, describe, expect, test } from "vitest";
import { memoStorage } from "../../../react-app/shared/lib/storage";
import type { MemoList } from "../../../react-app/entities/memo";

describe("memoStorage", () => {
  beforeEach(() => {
    // 各テスト前にlocalStorageをクリア
    localStorage.clear();
  });

  describe("save", () => {
    test("メモリストをlocalStorageに保存できる", () => {
      const memoList: MemoList = {
        memos: [
          { id: "1", content: "test memo 1", order: 0 },
          { id: "2", content: "test memo 2", order: 1 },
        ],
      };

      memoStorage.save(memoList);

      const saved = localStorage.getItem("murder-mystery-memos");
      expect(saved).toBe(JSON.stringify(memoList));
    });

    test("空のメモリストも保存できる", () => {
      const memoList: MemoList = { memos: [] };

      memoStorage.save(memoList);

      const saved = localStorage.getItem("murder-mystery-memos");
      expect(saved).toBe(JSON.stringify(memoList));
    });
  });

  describe("load", () => {
    test("保存されたメモリストを読み込める", () => {
      const memoList: MemoList = {
        memos: [
          { id: "1", content: "test memo 1", order: 0 },
          { id: "2", content: "test memo 2", order: 1 },
        ],
      };
      localStorage.setItem("murder-mystery-memos", JSON.stringify(memoList));

      const loaded = memoStorage.load();

      expect(loaded).toEqual(memoList);
    });

    test("データがない場合はnullを返す", () => {
      const loaded = memoStorage.load();

      expect(loaded).toBeNull();
    });

    test("不正なJSONの場合はnullを返す", () => {
      localStorage.setItem("murder-mystery-memos", "invalid json");

      const loaded = memoStorage.load();

      expect(loaded).toBeNull();
    });
  });

  describe("clear", () => {
    test("メモリストをlocalStorageから削除できる", () => {
      const memoList: MemoList = {
        memos: [{ id: "1", content: "test memo", order: 0 }],
      };
      localStorage.setItem("murder-mystery-memos", JSON.stringify(memoList));

      memoStorage.clear();

      const saved = localStorage.getItem("murder-mystery-memos");
      expect(saved).toBeNull();
    });
  });
});
