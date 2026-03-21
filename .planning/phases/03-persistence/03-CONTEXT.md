# Phase 3: Persistence - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

メモデータ（内容・位置）をlocalStorageに保存し、ページリロード後に復元する。破損・欠損データでもクラッシュせず空キャンバスで起動する。リセット機能やビジュアルデザインは後続フェーズ。

</domain>

<decisions>
## Implementation Decisions

### 保存タイミング

- **D-01:** ノード追加・編集確定・削除のたびに即座にlocalStorageへ保存する
- **D-02:** ドラッグ中はリアルタイム保存しない。onNodeDragStop（ドラッグ完了時）のみ保存する
- **D-03:** useEffect([nodes]) でノード配列の変更を監視して保存トリガーとする

### 保存データの範囲

- **D-04:** 必要最小限のデータのみ保存する — `{ id, content, position: { x, y } }` の配列
- **D-05:** ReactFlow内部のUI状態（isEditing, measured, dragging等）は保存しない
- **D-06:** 復元時はisEditing: false, type: "memo" を付与してMemoNodeとして再構築する

### エラーハンドリング

- **D-07:** localStorage のデータが破損・パース不能の場合はサイレントに空キャンバスで開始する（console.errorに記録のみ）
- **D-08:** localStorage の容量超過で保存失敗した場合もサイレントに失敗する（console.errorに記録のみ）
- **D-09:** ユーザーへのトースト通知やエラーUIは表示しない — ゲーム中の集中を妨げない

### Claude's Discretion

- localStorageのキー名
- valibot スキーマの具体的な定義
- storage.ts のモジュール配置（shared/lib vs features/canvas/model）
- useEffect依存配列の最適化方法

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<canonical_refs>

## Canonical References

### プロジェクト仕様

- `.planning/REQUIREMENTS.md` — PERS-01, PERS-02 の要件定義
- `.planning/ROADMAP.md` — Phase 3 のゴール、成功基準

### 先行フェーズの決定事項

- `.planning/phases/02-memo-interaction/02-CONTEXT.md` — MemoNodeDataの型定義（content, isEditing）、空メモ保持（D-12）、編集確定フロー（D-07: blur, D-12: Shift+Enter）

### 既知の注意点

- `.planning/STATE.md` §Blockers/Concerns — deleteKeyCode={null} とtextareaのstopPropagation

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/features/canvas/model/memo-node.ts` — MemoNodeData型定義（content, isEditing, index signature）。保存スキーマはこの型と整合させる
- `src/shared/lib/utils.ts` — `cn()` ユーティリティ（このフェーズでは未使用の可能性あり）

### Established Patterns

- Feature-Sliced Design: `features/canvas/` にキャンバス関連ロジック集約
- valibot を既にプロジェクト依存に持っている — スキーマバリデーションに使用可能
- 公開APIは `index.ts` 経由でエクスポート

### Integration Points

- `src/features/canvas/ui/MemoCanvas.tsx` — `useNodesState<MemoNode>([])` の初期値を loadMemos() に変更。onNodeDragStop と nodes 変更監視で saveMemos() を呼び出す
- `src/features/canvas/model/memo-node.ts` — 保存用の型（SavedMemoData等）を追加する可能性あり

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 03-persistence_
_Context gathered: 2026-03-21_
