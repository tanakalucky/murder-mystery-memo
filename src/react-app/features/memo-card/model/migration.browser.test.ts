import { migrateIfNeeded } from "./migration";
import type { MemoCard } from "./types";

const CARDS_KEY = "murder-mystery-memo-cards";
const OLD_GROUPS_KEY = "murder-mystery-memo-groups";
const OLD_LIST_ORDER_KEY = "murder-mystery-memo-list-order";
const COLLAPSE_STATE_KEY = "murder-mystery-memo-collapse-state";
const MIGRATION_VERSION_KEY = "murder-mystery-memo-migration-version";

beforeEach(() => {
  localStorage.clear();
});

describe("migrateIfNeeded", () => {
  it("旧グループデータをMemoCardに変換する", () => {
    localStorage.setItem(
      OLD_GROUPS_KEY,
      JSON.stringify([
        { id: "g1", name: "容疑者リスト", createdAt: 1000, isCollapsed: false },
        { id: "g2", name: "動機", createdAt: 2000, isCollapsed: true },
      ]),
    );

    localStorage.setItem(
      CARDS_KEY,
      JSON.stringify([
        { id: "c1", body: "田中は怪しい", createdAt: 3000, groupId: "g1" },
        { id: "c2", body: "佐藤のアリバイ", createdAt: 4000 },
      ]),
    );

    migrateIfNeeded();

    const cards = JSON.parse(localStorage.getItem(CARDS_KEY)!) as MemoCard[];

    // 元のカードのgroupIdがparentIdに変換されている
    const c1 = cards.find((c) => c.id === "c1");
    expect(c1?.parentId).toBe("g1");
    expect(
      "groupId" in c1! === false || (c1 as unknown as { groupId?: string }).groupId === undefined,
    ).toBe(true);

    // グループ無しのカードはそのまま
    const c2 = cards.find((c) => c.id === "c2");
    expect(c2?.parentId).toBeUndefined();

    // グループがカードとして追加されている
    const g1Card = cards.find((c) => c.id === "g1");
    expect(g1Card?.body).toBe("容疑者リスト");

    const g2Card = cards.find((c) => c.id === "g2");
    expect(g2Card?.body).toBe("動機");

    expect(cards).toHaveLength(4);
  });

  it("折りたたみ状態が移行される", () => {
    localStorage.setItem(
      OLD_GROUPS_KEY,
      JSON.stringify([{ id: "g1", name: "テスト", createdAt: 1000, isCollapsed: true }]),
    );

    migrateIfNeeded();

    const collapseState = JSON.parse(localStorage.getItem(COLLAPSE_STATE_KEY)!);
    expect(collapseState).toEqual({ g1: true });
  });

  it("listOrder内のgroupタイプがcardタイプに変換される", () => {
    localStorage.setItem(
      OLD_GROUPS_KEY,
      JSON.stringify([{ id: "g1", name: "テスト", createdAt: 1000, isCollapsed: false }]),
    );

    localStorage.setItem(
      OLD_LIST_ORDER_KEY,
      JSON.stringify([
        { type: "card", id: "c1" },
        { type: "group", id: "g1" },
      ]),
    );

    migrateIfNeeded();

    const listOrder = JSON.parse(localStorage.getItem(OLD_LIST_ORDER_KEY)!);
    expect(listOrder).toEqual([
      { type: "card", id: "c1" },
      { type: "card", id: "g1" },
    ]);
  });

  it("旧グループデータが削除される", () => {
    localStorage.setItem(
      OLD_GROUPS_KEY,
      JSON.stringify([{ id: "g1", name: "テスト", createdAt: 1000, isCollapsed: false }]),
    );

    migrateIfNeeded();

    expect(localStorage.getItem(OLD_GROUPS_KEY)).toBeNull();
  });

  it("二重実行されない（冪等性）", () => {
    localStorage.setItem(
      OLD_GROUPS_KEY,
      JSON.stringify([{ id: "g1", name: "テスト", createdAt: 1000, isCollapsed: false }]),
    );

    migrateIfNeeded();

    const cardsAfterFirst = JSON.parse(localStorage.getItem(CARDS_KEY)!) as MemoCard[];
    const countAfterFirst = cardsAfterFirst.length;

    // 再度グループデータを設定しても、バージョンマーカーがあるので実行されない
    localStorage.setItem(
      OLD_GROUPS_KEY,
      JSON.stringify([{ id: "g2", name: "追加", createdAt: 2000, isCollapsed: false }]),
    );

    migrateIfNeeded();

    const cardsAfterSecond = JSON.parse(localStorage.getItem(CARDS_KEY)!) as MemoCard[];
    expect(cardsAfterSecond).toHaveLength(countAfterFirst);
  });

  it("グループデータがない場合は何もしない", () => {
    localStorage.setItem(
      CARDS_KEY,
      JSON.stringify([{ id: "c1", body: "テスト", createdAt: 1000 }]),
    );

    migrateIfNeeded();

    const cards = JSON.parse(localStorage.getItem(CARDS_KEY)!) as MemoCard[];
    expect(cards).toHaveLength(1);
    expect(localStorage.getItem(MIGRATION_VERSION_KEY)).toBe("1");
  });
});
