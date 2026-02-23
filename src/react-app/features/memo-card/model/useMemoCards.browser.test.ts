import { renderHook } from "vitest-browser-react";

import { useMemoCards } from "./useMemoCards";

beforeEach(() => {
  localStorage.clear();
});

describe("useMemoCards - moveCardToGroup", () => {
  it("カードをグループに移動できる", async () => {
    const { result, act } = await renderHook(() => useMemoCards());

    let cardId: string;
    await act(() => {
      cardId = result.current.addCard("テストメモ");
    });

    await act(() => {
      result.current.moveCardToGroup(cardId, "g1");
    });

    expect(result.current.cards.find((c) => c.id === cardId)?.groupId).toBe("g1");
  });

  it("カードをグループから取り外せる", async () => {
    const { result, act } = await renderHook(() => useMemoCards());

    let cardId: string;
    await act(() => {
      cardId = result.current.addCard("テストメモ");
    });

    await act(() => {
      result.current.moveCardToGroup(cardId, "g1");
    });

    await act(() => {
      result.current.moveCardToGroup(cardId, undefined);
    });

    expect(result.current.cards.find((c) => c.id === cardId)?.groupId).toBeUndefined();
  });

  it("グループ移動後にリロードしても状態が復元される", async () => {
    const { result: first, act } = await renderHook(() => useMemoCards());

    let cardId: string;
    await act(() => {
      cardId = first.current.addCard("テストメモ");
    });

    await act(() => {
      first.current.moveCardToGroup(cardId, "g1");
    });

    const { result: second } = await renderHook(() => useMemoCards());

    expect(second.current.cards.find((c) => c.id === cardId)?.groupId).toBe("g1");
  });
});

describe("useMemoCards - clearGroupFromCards", () => {
  it("指定グループの全カードからgroupIdをクリアする", async () => {
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
      result.current.moveCardToGroup(cardId1, "g1");
      result.current.moveCardToGroup(cardId2, "g1");
      result.current.moveCardToGroup(cardId3, "g2");
    });

    await act(() => {
      result.current.clearGroupFromCards("g1");
    });

    expect(result.current.cards.find((c) => c.id === cardId1)?.groupId).toBeUndefined();
    expect(result.current.cards.find((c) => c.id === cardId2)?.groupId).toBeUndefined();
    expect(result.current.cards.find((c) => c.id === cardId3)?.groupId).toBe("g2");
  });

  it("クリア後にリロードしても状態が復元される", async () => {
    const { result: first, act } = await renderHook(() => useMemoCards());

    let cardId: string;
    await act(() => {
      cardId = first.current.addCard("テストメモ");
    });

    await act(() => {
      first.current.moveCardToGroup(cardId, "g1");
    });

    await act(() => {
      first.current.clearGroupFromCards("g1");
    });

    const { result: second } = await renderHook(() => useMemoCards());

    expect(second.current.cards.find((c) => c.id === cardId)?.groupId).toBeUndefined();
  });
});
