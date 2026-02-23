import { renderHook } from "vitest-browser-react";

import { useMemoCards } from "./useMemoCards";

beforeEach(() => {
  localStorage.clear();
});

describe("useMemoCards - moveCardToParent", () => {
  it("カードを親に設定できる", async () => {
    const { result, act } = await renderHook(() => useMemoCards());

    let cardId: string;
    await act(() => {
      cardId = result.current.addCard("テストメモ");
    });

    await act(() => {
      result.current.moveCardToParent(cardId, "p1");
    });

    expect(result.current.cards.find((c) => c.id === cardId)?.parentId).toBe("p1");
  });

  it("カードを親から外せる", async () => {
    const { result, act } = await renderHook(() => useMemoCards());

    let cardId: string;
    await act(() => {
      cardId = result.current.addCard("テストメモ");
    });

    await act(() => {
      result.current.moveCardToParent(cardId, "p1");
    });

    await act(() => {
      result.current.moveCardToParent(cardId, undefined);
    });

    expect(result.current.cards.find((c) => c.id === cardId)?.parentId).toBeUndefined();
  });

  it("親設定後にリロードしても状態が復元される", async () => {
    const { result: first, act } = await renderHook(() => useMemoCards());

    let cardId: string;
    await act(() => {
      cardId = first.current.addCard("テストメモ");
    });

    await act(() => {
      first.current.moveCardToParent(cardId, "p1");
    });

    const { result: second } = await renderHook(() => useMemoCards());

    expect(second.current.cards.find((c) => c.id === cardId)?.parentId).toBe("p1");
  });
});

describe("useMemoCards - clearChildrenFromParent", () => {
  it("指定親の全カードからparentIdをクリアする", async () => {
    const { result, act } = await renderHook(() => useMemoCards());

    let cardId1: string;
    let cardId2: string;
    let cardId3: string;
    await act(() => {
      cardId1 = result.current.addCard("メモ1");
      cardId2 = result.current.addCard("メモ2");
      cardId3 = result.current.addCard("メモ3");
    });

    await act(() => {
      result.current.moveCardToParent(cardId1, "p1");
      result.current.moveCardToParent(cardId2, "p1");
      result.current.moveCardToParent(cardId3, "p2");
    });

    await act(() => {
      result.current.clearChildrenFromParent("p1");
    });

    expect(result.current.cards.find((c) => c.id === cardId1)?.parentId).toBeUndefined();
    expect(result.current.cards.find((c) => c.id === cardId2)?.parentId).toBeUndefined();
    expect(result.current.cards.find((c) => c.id === cardId3)?.parentId).toBe("p2");
  });

  it("クリア後にリロードしても状態が復元される", async () => {
    const { result: first, act } = await renderHook(() => useMemoCards());

    let cardId: string;
    await act(() => {
      cardId = first.current.addCard("テストメモ");
    });

    await act(() => {
      first.current.moveCardToParent(cardId, "p1");
    });

    await act(() => {
      first.current.clearChildrenFromParent("p1");
    });

    const { result: second } = await renderHook(() => useMemoCards());

    expect(second.current.cards.find((c) => c.id === cardId)?.parentId).toBeUndefined();
  });
});
