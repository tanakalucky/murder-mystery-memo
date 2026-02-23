import { loadGroups, loadListOrder, saveGroups, saveListOrder } from "./storage";
import type { MemoGroup, MemoListItem } from "./types";

beforeEach(() => {
  localStorage.clear();
});

describe("loadGroups / saveGroups", () => {
  it("保存したグループを読み込める", () => {
    const groups: MemoGroup[] = [{ id: "g1", name: "田中", createdAt: 1000, isCollapsed: false }];

    saveGroups(groups);
    const loaded = loadGroups();

    expect(loaded).toEqual(groups);
  });

  it("データが存在しない場合は空配列を返す", () => {
    const loaded = loadGroups();

    expect(loaded).toEqual([]);
  });

  it("不正なJSONの場合は空配列を返す", () => {
    localStorage.setItem("murder-mystery-memo-groups", "invalid-json");

    const loaded = loadGroups();

    expect(loaded).toEqual([]);
  });
});

describe("loadListOrder / saveListOrder", () => {
  it("保存した表示順序を読み込める", () => {
    const order: MemoListItem[] = [
      { type: "group", id: "g1" },
      { type: "card", id: "c1" },
    ];

    saveListOrder(order);
    const loaded = loadListOrder();

    expect(loaded).toEqual(order);
  });

  it("データが存在しない場合はnullを返す", () => {
    const loaded = loadListOrder();

    expect(loaded).toBeNull();
  });

  it("不正なJSONの場合はnullを返す", () => {
    localStorage.setItem("murder-mystery-memo-list-order", "invalid-json");

    const loaded = loadListOrder();

    expect(loaded).toBeNull();
  });
});
