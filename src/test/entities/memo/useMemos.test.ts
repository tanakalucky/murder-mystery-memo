import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { useMemos } from "../../../react-app/entities/memo/model/useMemos";

describe("useMemos", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  test("初期化時にLocalStorageから既存データを読み込む", async () => {
    const existingData = {
      memos: [
        { id: "1", content: "メモ1", order: 0 },
        { id: "2", content: "メモ2", order: 1 },
      ],
    };
    localStorage.setItem("murder-mystery-memos", JSON.stringify(existingData));

    const { result } = renderHook(() => useMemos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.memos).toEqual(existingData.memos);
  });

  test("初期化時にLocalStorageが空の場合、空配列になる", async () => {
    const { result } = renderHook(() => useMemos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.memos).toEqual([]);
  });

  test("addMemoでメモを追加できる", async () => {
    const { result } = renderHook(() => useMemos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.addMemo("新しいメモ");

    await waitFor(() => {
      expect(result.current.memos).toHaveLength(1);
    });

    expect(result.current.memos[0].content).toBe("新しいメモ");
    expect(result.current.memos[0].order).toBe(0);
    expect(result.current.memos[0].id).toBeDefined();
  });

  test("複数のメモを追加すると正しい順序番号が割り当てられる", async () => {
    const { result } = renderHook(() => useMemos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.addMemo("メモ1");

    await waitFor(() => {
      expect(result.current.memos).toHaveLength(1);
    });

    result.current.addMemo("メモ2");

    await waitFor(() => {
      expect(result.current.memos).toHaveLength(2);
    });

    expect(result.current.memos[0].order).toBe(0);
    expect(result.current.memos[1].order).toBe(1);
  });

  test("updateMemoでメモの内容を更新できる", async () => {
    const { result } = renderHook(() => useMemos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.addMemo("元のメモ");

    await waitFor(() => {
      expect(result.current.memos).toHaveLength(1);
    });

    const memoId = result.current.memos[0].id;
    result.current.updateMemo(memoId, "更新されたメモ");

    await waitFor(() => {
      expect(result.current.memos[0].content).toBe("更新されたメモ");
    });

    expect(result.current.memos[0].id).toBe(memoId);
  });

  test("deleteMemでメモを削除できる", async () => {
    const { result } = renderHook(() => useMemos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.addMemo("削除されるメモ");
    result.current.addMemo("残るメモ");

    await waitFor(() => {
      expect(result.current.memos).toHaveLength(2);
    });

    const deleteId = result.current.memos[0].id;
    result.current.deleteMemo(deleteId);

    await waitFor(() => {
      expect(result.current.memos).toHaveLength(1);
    });

    expect(result.current.memos[0].content).toBe("残るメモ");
  });

  test("reorderMemosでメモの順序を変更できる", async () => {
    const { result } = renderHook(() => useMemos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.addMemo("メモ1");
    result.current.addMemo("メモ2");
    result.current.addMemo("メモ3");

    await waitFor(() => {
      expect(result.current.memos).toHaveLength(3);
    });

    result.current.reorderMemos(0, 2);

    await waitFor(() => {
      expect(result.current.memos[0].content).toBe("メモ2");
    });

    expect(result.current.memos[0].content).toBe("メモ2");
    expect(result.current.memos[1].content).toBe("メモ3");
    expect(result.current.memos[2].content).toBe("メモ1");
    expect(result.current.memos[0].order).toBe(0);
    expect(result.current.memos[1].order).toBe(1);
    expect(result.current.memos[2].order).toBe(2);
  });

  test("resetMemosで全メモを削除できる", async () => {
    const { result } = renderHook(() => useMemos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    result.current.addMemo("メモ1");
    result.current.addMemo("メモ2");

    await waitFor(() => {
      expect(result.current.memos).toHaveLength(2);
    });

    result.current.resetMemos();

    await waitFor(() => {
      expect(result.current.memos).toHaveLength(0);
    });
  });

  test("メモの追加・更新・削除が自動的にLocalStorageに保存される", async () => {
    const { result } = renderHook(() => useMemos());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.addMemo("保存されるメモ");
    });

    await waitFor(() => {
      const saved = localStorage.getItem("murder-mystery-memos");
      expect(saved).not.toBeNull();
      if (saved) {
        const parsed = JSON.parse(saved);
        expect(parsed.memos).toHaveLength(1);
        expect(parsed.memos[0].content).toBe("保存されるメモ");
      }
    });
  });
});
