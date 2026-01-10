import { useMemos } from "../../../entities/memo";
import { MemoInput } from "../../../features/memo-input";
import { MemoList } from "../../../features/memo-list";
import { ResetButton } from "../../../features/memo-reset";

export function MemoPage() {
  const { memos, addMemo, updateMemo, deleteMemo, reorderMemos, resetMemos } = useMemos();

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <div className="w-full max-w-6xl mx-auto px-6 py-4 flex flex-col h-full">
        {/* コンパクトなヘッダー */}
        <header className="flex justify-between items-center mb-6 animate-fade-in">
          <div className="flex items-baseline gap-6">
            <h1
              className="text-3xl font-bold tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "var(--color-accent-secondary)",
                textShadow: "var(--shadow-glow)",
              }}
            >
              Murder Mystery
            </h1>
            <div className="flex items-center gap-2">
              <span
                className="text-lg font-bold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--color-accent-primary)",
                }}
              >
                {memos.length}
              </span>
              <span
                className="text-sm"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "var(--color-text-secondary)",
                  letterSpacing: "0.05em",
                }}
              >
                Evidence
              </span>
            </div>
          </div>
          <ResetButton onReset={resetMemos} />
        </header>

        {/* メモ一覧 - 最大領域 */}
        <div
          className="flex-1 overflow-y-auto mb-4 py-2 animate-fade-in"
          style={{
            animationDelay: "0.1s",
            minHeight: 0, // flexboxでのスクロール有効化
          }}
        >
          {memos.length === 0 ? (
            <div
              className="h-full flex items-center justify-center"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
              }}
            >
              <p className="text-center">
                メモを入力して証拠を記録しましょう
                <br />
                <span className="text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                  Enter to add · Double-click to edit · Drag to reorder
                </span>
              </p>
            </div>
          ) : (
            <MemoList
              memos={memos}
              onUpdate={updateMemo}
              onDelete={deleteMemo}
              onReorder={reorderMemos}
            />
          )}
        </div>

        {/* メモ入力エリア - 固定 */}
        <div
          className="shrink-0 pt-3 pb-4 animate-fade-in"
          style={{
            backgroundColor: "var(--color-bg-primary)",
            animationDelay: "0.2s",
          }}
        >
          <div
            className="p-1 rounded-lg"
            style={{
              background:
                "linear-gradient(135deg, var(--color-accent-primary) 0%, var(--color-accent-secondary) 100%)",
            }}
          >
            <div
              className="rounded-md"
              style={{
                backgroundColor: "var(--color-bg-primary)",
              }}
            >
              <MemoInput onAdd={addMemo} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
