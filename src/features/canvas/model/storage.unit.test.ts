import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadMemos, saveMemos } from "./storage";

// localStorageのモック
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

vi.stubGlobal("localStorage", localStorageMock);

const STORAGE_KEY = "murder-mystery-memo:memos";

describe("loadMemos", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("localStorageにキーが存在しない場合、空配列を返す", () => {
    const result = loadMemos();
    expect(result).toEqual([]);
  });

  it("有効なデータが存在する場合、MemoNode[]を返す", () => {
    const validData = [
      { id: "node-1", content: "テストメモ", position: { x: 100, y: 200 } },
      { id: "node-2", content: "別のメモ", position: { x: 300, y: 400 } },
    ];
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(validData));

    const result = loadMemos();

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: "node-1",
      type: "memo",
      position: { x: 100, y: 200 },
      data: { content: "テストメモ", isEditing: false },
    });
    expect(result[1]).toMatchObject({
      id: "node-2",
      type: "memo",
      position: { x: 300, y: 400 },
      data: { content: "別のメモ", isEditing: false },
    });
  });

  it("復元時にtype: 'memo'がセットされる (D-06)", () => {
    const validData = [{ id: "node-1", content: "メモ", position: { x: 0, y: 0 } }];
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(validData));

    const result = loadMemos();

    expect(result[0].type).toBe("memo");
  });

  it("復元時にisEditing: falseがセットされる (D-06)", () => {
    const validData = [{ id: "node-1", content: "メモ", position: { x: 0, y: 0 } }];
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(validData));

    const result = loadMemos();

    expect(result[0].data.isEditing).toBe(false);
  });

  it("不正なJSON（パース不能）の場合、空配列を返し、console.errorを呼ぶ", () => {
    localStorageMock.setItem(STORAGE_KEY, "invalid json {{{");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = loadMemos();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledOnce();
  });

  it("有効なJSONだがスキーマが不正な場合（position.xが欠落）、空配列を返し、console.errorを呼ぶ", () => {
    const invalidSchema = [{ id: "node-1", content: "メモ", position: { y: 200 } }];
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(invalidSchema));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = loadMemos();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledOnce();
  });

  it("有効なJSONだがidが欠落した場合、空配列を返し、console.errorを呼ぶ", () => {
    const invalidSchema = [{ content: "メモ", position: { x: 100, y: 200 } }];
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(invalidSchema));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const result = loadMemos();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledOnce();
  });

  it("空配列が保存されている場合、空配列を返す", () => {
    localStorageMock.setItem(STORAGE_KEY, JSON.stringify([]));

    const result = loadMemos();

    expect(result).toEqual([]);
  });
});

describe("saveMemos", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("MemoNode[]をlocalStorageに保存する", () => {
    const nodes = [
      {
        id: "node-1",
        type: "memo" as const,
        position: { x: 100, y: 200 },
        data: { content: "テストメモ", isEditing: false },
      },
    ];

    saveMemos(nodes);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      STORAGE_KEY,
      expect.stringContaining("node-1"),
    );
  });

  it("isEditingを保存しない (D-05)", () => {
    const nodes = [
      {
        id: "node-1",
        type: "memo" as const,
        position: { x: 100, y: 200 },
        data: { content: "テストメモ", isEditing: true },
      },
    ];

    saveMemos(nodes);

    const stored = localStorageMock.setItem.mock.calls[0][1] as string;
    const parsed = JSON.parse(stored) as unknown[];
    const savedNode = parsed[0] as Record<string, unknown>;
    expect(savedNode).not.toHaveProperty("isEditing");
    expect(savedNode).not.toHaveProperty("data");
  });

  it("ReactFlow内部フィールド（measured, dragging）を保存しない (D-05)", () => {
    const nodes = [
      {
        id: "node-1",
        type: "memo" as const,
        position: { x: 100, y: 200 },
        data: { content: "テストメモ", isEditing: false },
        measured: { width: 192, height: 40 },
        dragging: false,
        selected: true,
      },
    ];

    saveMemos(nodes as Parameters<typeof saveMemos>[0]);

    const stored = localStorageMock.setItem.mock.calls[0][1] as string;
    const parsed = JSON.parse(stored) as unknown[];
    const savedNode = parsed[0] as Record<string, unknown>;
    expect(savedNode).not.toHaveProperty("measured");
    expect(savedNode).not.toHaveProperty("dragging");
    expect(savedNode).not.toHaveProperty("selected");
    expect(Object.keys(savedNode)).toEqual(["id", "content", "position"]);
  });

  it("保存するフィールドはid, content, positionのみ (D-04)", () => {
    const nodes = [
      {
        id: "node-1",
        type: "memo" as const,
        position: { x: 100, y: 200 },
        data: { content: "テストメモ", isEditing: false },
      },
    ];

    saveMemos(nodes);

    const stored = localStorageMock.setItem.mock.calls[0][1] as string;
    const parsed = JSON.parse(stored) as unknown[];
    const savedNode = parsed[0] as Record<string, unknown>;
    expect(Object.keys(savedNode)).toEqual(["id", "content", "position"]);
    expect(savedNode.id).toBe("node-1");
    expect(savedNode.content).toBe("テストメモ");
    expect(savedNode.position).toEqual({ x: 100, y: 200 });
  });

  it("QuotaExceededErrorが発生した場合、サイレントに失敗し、console.errorを呼ぶ (D-08)", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new DOMException("QuotaExceededError", "QuotaExceededError");
    });

    const nodes = [
      {
        id: "node-1",
        type: "memo" as const,
        position: { x: 100, y: 200 },
        data: { content: "テストメモ", isEditing: false },
      },
    ];

    // クラッシュしないこと
    expect(() => saveMemos(nodes)).not.toThrow();
    expect(consoleSpy).toHaveBeenCalledOnce();
  });

  it("空配列を保存できる", () => {
    saveMemos([]);

    expect(localStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEY, "[]");
  });
});
