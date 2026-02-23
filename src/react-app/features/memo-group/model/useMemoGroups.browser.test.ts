import { renderHook } from "vitest-browser-react";

import { useMemoGroups } from "./useMemoGroups";

beforeEach(() => {
  localStorage.clear();
});

describe("useMemoGroups", () => {
  it("list-orderが存在しない場合、既存カードから自動生成する（後方互換）", async () => {
    const cards = [
      { id: "c1", groupId: undefined },
      { id: "c2", groupId: undefined },
    ];

    const { result } = await renderHook(() => useMemoGroups(cards));

    expect(result.current.listOrder).toEqual([
      { type: "card", id: "c1" },
      { type: "card", id: "c2" },
    ]);
  });

  it("グループ付きカードはlist-orderの自動生成時に含まれない", async () => {
    const cards = [
      { id: "c1", groupId: undefined },
      { id: "c2", groupId: "g1" },
    ];

    const { result } = await renderHook(() => useMemoGroups(cards));

    expect(result.current.listOrder).toEqual([{ type: "card", id: "c1" }]);
  });

  it("グループを追加できる", async () => {
    const { result, act } = await renderHook(() => useMemoGroups([]));

    await act(() => {
      result.current.addGroup("田中");
    });

    expect(result.current.groups).toHaveLength(1);
    expect(result.current.groups[0].name).toBe("田中");
    expect(result.current.groups[0].isCollapsed).toBe(false);
    expect(result.current.listOrder).toHaveLength(1);
    expect(result.current.listOrder[0].type).toBe("group");
  });

  it("グループを削除すると中のカードがlistOrderに展開される", async () => {
    const { result, act } = await renderHook(() => useMemoGroups([]));

    let groupId: string;
    await act(() => {
      groupId = result.current.addGroup("田中");
    });

    await act(() => {
      result.current.deleteGroup(groupId, ["c1", "c2"]);
    });

    expect(result.current.groups).toHaveLength(0);
    expect(result.current.listOrder).toEqual([
      { type: "card", id: "c1" },
      { type: "card", id: "c2" },
    ]);
  });

  it("グループ名を変更できる", async () => {
    const { result, act } = await renderHook(() => useMemoGroups([]));

    let groupId: string;
    await act(() => {
      groupId = result.current.addGroup("田中");
    });

    await act(() => {
      result.current.renameGroup(groupId, "佐藤");
    });

    expect(result.current.groups[0].name).toBe("佐藤");
  });

  it("グループの折りたたみを切り替えられる", async () => {
    const { result, act } = await renderHook(() => useMemoGroups([]));

    let groupId: string;
    await act(() => {
      groupId = result.current.addGroup("田中");
    });

    await act(() => {
      result.current.toggleCollapse(groupId);
    });

    expect(result.current.groups[0].isCollapsed).toBe(true);

    await act(() => {
      result.current.toggleCollapse(groupId);
    });

    expect(result.current.groups[0].isCollapsed).toBe(false);
  });

  it("リロード後も状態が復元される", async () => {
    const { result: first, act } = await renderHook(() => useMemoGroups([]));

    await act(() => {
      first.current.addGroup("田中");
    });

    const { result: second } = await renderHook(() => useMemoGroups([]));

    expect(second.current.groups).toHaveLength(1);
    expect(second.current.groups[0].name).toBe("田中");
    expect(second.current.listOrder).toHaveLength(1);
  });
});
