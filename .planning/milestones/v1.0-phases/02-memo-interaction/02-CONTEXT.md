# Phase 2: Memo Interaction - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

キャンバス上でメモを作成・編集・移動できるようにする。ダブルクリックで新規作成、テキスト編集（Enter=改行、Shift+Enter=確定、Escape=キャンセル）、ダブルクリックで再編集、メモ外クリックで確定、ドラッグで自由移動。永続化とビジュアルデザインは後続フェーズ。

</domain>

<decisions>
## Implementation Decisions

### メモカードの表示

- **D-01:** 固定幅のカードレイアウト（付箋スタイル）— 統一感を重視
- **D-02:** 表示モードでは全文表示（高さ制限なし）— 内容が長ければカードが縦に伸びる
- **D-03:** 空メモ（内容なし）も残す — プレースホルダー的な表示で空カードとして存在
- **D-04:** Phase 2 のスタイルは最低限（白背景・黒テキスト・ボーダー程度）— Phase 4 でノワール調に仕上げる

### 編集体験

- **D-05:** テキストエリアは入力行数に応じて自動リサイズ（スクロールバーなし）
- **D-06:** プレースホルダーテキストあり（空のテキストエリアにヒント表示）
- **D-07:** 編集中と表示モードの視覚的区別は最低限 — テキストエリアの存在自体が区別になる
- **D-08:** 編集中はドラッグ無効 — テキスト選択・カーソル操作に専念

### 新規メモ作成

- **D-09:** ダブルクリック位置がメモの中心になるよう配置
- **D-10:** 作成時のアニメーションなし — 即座に表示、ゲーム中のテンポを妨げない
- **D-11:** 同じ場所に連続作成した場合は少しオフセットして配置 — 重なりを自動回避

### キーボード操作（既決事項）

- **D-12:** Enter で改行、Shift+Enter で編集確定、Escape で編集キャンセル（新規メモの場合は破棄しない — 空メモとして残る）
- **D-13:** `deleteKeyCode={null}` でDelete/Backspaceキーの競合を回避
- **D-14:** テキストエリアでのキーイベントは `stopPropagation` でReactFlowへの伝播を防止

### Claude's Discretion

- メモカードの具体的な固定幅の値
- ID生成方法
- 状態管理アプローチ（useNodesState / Zustand等）
- テキストエリア自動リサイズの実装方法
- プレースホルダーの具体的な文言
- オフセット量とオフセット方向のロジック

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<canonical_refs>

## Canonical References

### プロジェクト仕様

- `.planning/PROJECT.md` — データ構造定義（`{ id, content, position: {x, y} }`）、カラーパレット（Phase 4用参照）
- `.planning/REQUIREMENTS.md` — MEMO-01〜MEMO-08 の要件定義
- `.planning/ROADMAP.md` — Phase 2 のゴール、成功基準、プラン構成（02-01, 02-02）

### 既知の注意点

- `.planning/STATE.md` §Blockers/Concerns — `deleteKeyCode={null}` とtextareaの `stopPropagation` が必須

### 先行フェーズの決定事項

- `.planning/phases/01-canvas-foundation/01-CONTEXT.md` — NODE_TYPESモジュールスコープ定数（D-66対応）、ReactFlowProviderのローカル配置（D-12）、FSDレイヤー配置（D-14: `src/features/canvas/`）

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/features/canvas/model/node-types.ts` — 空の `NODE_TYPES` 定数。ここにMemoNodeのカスタムノードタイプを登録する
- `src/features/canvas/ui/MemoCanvas.tsx` — ReactFlowコンポーネント。`nodes={[]}` を状態管理に置き換え、`onDoubleClick` ハンドラを追加する
- `src/shared/lib/utils.ts` — `cn()` ユーティリティ（Tailwindクラス結合）

### Established Patterns

- Feature-Sliced Design: `features/canvas/` にキャンバス関連ロジックを集約
- 公開APIは `index.ts` 経由でエクスポート
- `@/*` エイリアスによるクロスレイヤーインポート

### Integration Points

- `src/features/canvas/model/node-types.ts` — MemoNodeコンポーネントを登録
- `src/features/canvas/ui/MemoCanvas.tsx` — ノード状態管理、ダブルクリックハンドラ、ドラッグ設定を追加
- `src/features/canvas/index.ts` — 必要に応じて新しいエクスポートを追加

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 02-memo-interaction_
_Context gathered: 2026-03-21_
