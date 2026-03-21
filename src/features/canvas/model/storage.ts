import * as v from "valibot";

import type { MemoNode } from "./memo-node";

const STORAGE_KEY = "murder-mystery-memo:memos";

const SavedMemoSchema = v.object({
  id: v.string(),
  content: v.string(),
  position: v.object({ x: v.number(), y: v.number() }),
});

const SavedMemosSchema = v.array(SavedMemoSchema);

type SavedMemo = v.InferOutput<typeof SavedMemoSchema>;

export function loadMemos(): MemoNode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return [];

    const result = v.safeParse(SavedMemosSchema, JSON.parse(raw) as unknown);

    if (!result.success) {
      console.error("メモデータの復元に失敗しました — 空のキャンバスで開始します", result.issues);
      return [];
    }

    // D-06: 復元時にtype: "memo" と isEditing: false を注入
    return result.output.map((memo) => ({
      id: memo.id,
      type: "memo" as const,
      position: memo.position,
      data: { content: memo.content, isEditing: false },
    }));
  } catch (error) {
    console.error("メモデータの読み込みに失敗しました", error);
    return [];
  }
}

export function saveMemos(nodes: MemoNode[]): void {
  try {
    // D-04: id, content, position のみ保存（D-05: ReactFlow内部フィールドは除外）
    const saved: SavedMemo[] = nodes.map((node) => ({
      id: node.id,
      content: node.data.content,
      position: node.position,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch (error) {
    // D-08: QuotaExceededError — サイレント失敗
    console.error("メモデータの保存に失敗しました", error);
  }
}
