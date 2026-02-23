import { renderHook } from "vitest-browser-react";

import type { MemoCard } from "./types";
import { useMemoListOrder } from "./useMemoListOrder";

beforeEach(() => {
  localStorage.clear();
});

describe("useMemoListOrder", () => {
  it("listOrderが存在しない場合、既存カードから自動生成する（後方互換）", async () => {
    const cards: MemoCard[] = [
      { id: "c1", body: "メモ1", createdAt: 1000 },
      { id: "c2", body: "メモ2", createdAt: 2000 },
    ];

    const { result } = await renderHook(() => useMemoListOrder(cards));

    expect(result.current.listOrder).toEqual([
      { type: "card", id: "c1" },
      { type: "card", id: "c2" },
    ]);
  });

  it("parentId付きカードはlistOrderの自動生成時に含まれない", async () => {
    const cards: MemoCard[] = [
      { id: "c1", body: "メモ1", createdAt: 1000 },
      { id: "c2", body: "メモ2", createdAt: 2000, parentId: "c1" },
    ];

    const { result } = await renderHook(() => useMemoListOrder(cards));

    expect(result.current.listOrder).toEqual([{ type: "card", id: "c1" }]);
  });

  it("カードをlistOrderに追加できる", async () => {
    const { result, act } = await renderHook(() => useMemoListOrder([]));

    await act(() => {
      result.current.addCardToListOrder("c1");
    });

    expect(result.current.listOrder).toEqual([{ type: "card", id: "c1" }]);
  });

  it("カードをlistOrderから削除できる", async () => {
    const cards: MemoCard[] = [
      { id: "c1", body: "メモ1", createdAt: 1000 },
      { id: "c2", body: "メモ2", createdAt: 2000 },
    ];

    const { result, act } = await renderHook(() => useMemoListOrder(cards));

    await act(() => {
      result.current.removeCardFromListOrder("c1");
    });

    expect(result.current.listOrder).toEqual([{ type: "card", id: "c2" }]);
  });

  it("listOrderの並べ替えができる", async () => {
    const cards: MemoCard[] = [
      { id: "c1", body: "メモ1", createdAt: 1000 },
      { id: "c2", body: "メモ2", createdAt: 2000 },
    ];

    const { result, act } = await renderHook(() => useMemoListOrder(cards));

    await act(() => {
      result.current.reorderListItems("c2", "c1");
    });

    expect(result.current.listOrder).toEqual([
      { type: "card", id: "c2" },
      { type: "card", id: "c1" },
    ]);
  });

  it("存在しないIDでreorderListItemsを呼んでも変更されない", async () => {
    const cards: MemoCard[] = [{ id: "c1", body: "メモ1", createdAt: 1000 }];

    const { result, act } = await renderHook(() => useMemoListOrder(cards));

    await act(() => {
      result.current.reorderListItems("nonexistent", "c1");
    });

    expect(result.current.listOrder).toEqual([{ type: "card", id: "c1" }]);
  });

  it("折りたたみ状態を切り替えられる", async () => {
    const { result, act } = await renderHook(() => useMemoListOrder([]));

    await act(() => {
      result.current.toggleCollapse("c1");
    });

    expect(result.current.collapseState["c1"]).toBe(true);

    await act(() => {
      result.current.toggleCollapse("c1");
    });

    expect(result.current.collapseState["c1"]).toBe(false);
  });

  it("dissolveParentで親カードの位置に子カードが挿入される", async () => {
    const cards: MemoCard[] = [
      { id: "c1", body: "メモ1", createdAt: 1000 },
      { id: "parent1", body: "親", createdAt: 2000 },
      { id: "c3", body: "メモ3", createdAt: 3000 },
    ];

    localStorage.setItem(
      "murder-mystery-memo-list-order",
      JSON.stringify([
        { type: "card", id: "c1" },
        { type: "card", id: "parent1" },
        { type: "card", id: "c3" },
      ]),
    );

    const { result, act } = await renderHook(() => useMemoListOrder(cards));

    await act(() => {
      result.current.dissolveParent("parent1", ["child1", "child2"]);
    });

    expect(result.current.listOrder).toEqual([
      { type: "card", id: "c1" },
      { type: "card", id: "child1" },
      { type: "card", id: "child2" },
      { type: "card", id: "c3" },
    ]);
  });

  it("dissolveParentで折りたたみ状態もクリアされる", async () => {
    localStorage.setItem(
      "murder-mystery-memo-list-order",
      JSON.stringify([{ type: "card", id: "parent1" }]),
    );
    localStorage.setItem("murder-mystery-memo-collapse-state", JSON.stringify({ parent1: true }));

    const cards: MemoCard[] = [{ id: "parent1", body: "親", createdAt: 1000 }];

    const { result, act } = await renderHook(() => useMemoListOrder(cards));

    expect(result.current.collapseState["parent1"]).toBe(true);

    await act(() => {
      result.current.dissolveParent("parent1", ["child1"]);
    });

    expect(result.current.collapseState["parent1"]).toBeUndefined();
  });

  it("リロード後も状態が復元される", async () => {
    const cards: MemoCard[] = [{ id: "c1", body: "メモ1", createdAt: 1000 }];

    const { result: first, act } = await renderHook(() => useMemoListOrder([]));

    await act(() => {
      first.current.addCardToListOrder("c1");
    });
    await act(() => {
      first.current.toggleCollapse("c1");
    });

    const { result: second } = await renderHook(() => useMemoListOrder(cards));

    expect(second.current.listOrder).toEqual([{ type: "card", id: "c1" }]);
    expect(second.current.collapseState["c1"]).toBe(true);
  });
});
