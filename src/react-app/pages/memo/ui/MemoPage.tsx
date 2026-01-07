import { useMemos } from "../../../entities/memo";
import { MemoInput } from "../../../features/memo-input";
import { MemoList } from "../../../features/memo-list";
import { ResetButton } from "../../../features/memo-reset";

export function MemoPage() {
  const { memos, addMemo, updateMemo, deleteMemo, reorderMemos, resetMemos } = useMemos();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="w-full max-w-3xl mx-auto p-6 flex-1 flex flex-col">
        {/* ヘッダーとリセットボタン */}
        <div className="flex justify-between items-center mb-8">
          <h1
            className="text-4xl font-serif tracking-wide"
            style={{
              color: "var(--color-accent)",
              textShadow: "0 0 10px rgba(212, 175, 55, 0.3)",
              fontFamily: "Georgia, serif",
            }}
          >
            マーダーミステリーメモ
          </h1>
          <ResetButton onReset={resetMemos} />
        </div>

        {/* メモ一覧 */}
        <div className="flex-1 overflow-y-auto mb-6">
          <MemoList
            memos={memos}
            onUpdate={updateMemo}
            onDelete={deleteMemo}
            onReorder={reorderMemos}
          />
        </div>

        {/* メモ入力 */}
        <div className="mt-auto">
          <MemoInput onAdd={addMemo} />
        </div>
      </div>
    </div>
  );
}
