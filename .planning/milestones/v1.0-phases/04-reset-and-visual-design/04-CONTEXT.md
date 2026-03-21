# Phase 4: Reset and Visual Design - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

リセットボタン（確認ダイアログ付き全メモ削除）を実装し、キャンバス・メモカード・UIクロームにダークノワール調のビジュアルデザインを適用する。カラーパレットとフォントはPROJECT.mdで定義済み。新機能の追加はスコープ外。

</domain>

<decisions>
## Implementation Decisions

### リセットボタンの表示

- **D-01:** アイコン＋テキストの組み合わせ（例: ゴミ箱アイコン + 「リセット」ラベル）
- **D-02:** 画面右上に固定配置（VIS-03）
- **D-03:** ノワール配色に溶け込むスタイル

### 確認ダイアログ

- **D-04:** シンプル実用的な文言 — 「すべてのメモを削除しますか？」
- **D-05:** ボタンラベルは「削除」「キャンセル」
- **D-06:** shadcn AlertDialog のデフォルトスタイルをノワール配色に合わせる（凝った装飾は不要）

### リセット動作

- **D-07:** 確認後に `setNodes([])` で全ノード削除 + localStorage クリア
- **D-08:** キャンセル時はメモをそのまま維持

### メモカードのノワール変換

- **D-09:** 背景を Old Paper (`#f5ede0`) 単色に変更
- **D-10:** ボーダーを Aged Wood (`#3d2e1e`) の細いボーダーに変更
- **D-11:** 編集モードの視覚的区別は最低限（Phase 2 D-07と同じ方針 — テキストエリアの存在自体が区別）
- **D-12:** テキスト色を Ink Black (`#2a1f14`) に変更

### フォント適用

- **D-13:** メモ本文は `font-family: "Playfair Display", "Noto Serif JP", serif` のスタック（仕様通り）
- **D-14:** UIテキスト全般（リセットボタン、ダイアログ等）は Noto Sans JP

### キャンバス全体

- **D-15:** キャンバス背景は Noir Black (`#1a1108`) 単色 — パターンなし
- **D-16:** ReactFlowのUIコントロール（ズームボタン等）はすべて非表示
- **D-17:** ReactFlowのハンドル（接続ポイント）は非表示、選択ハイライトもノワール調に合わせる

### カラーパレットの管理

- **D-18:** ノワールパレット全色を Tailwind カスタムカラーとして `index.css` に定義し、プロジェクト全体で再利用可能にする

### Claude's Discretion

- リセットボタンの具体的なアイコン選択（lucide-react から）
- AlertDialog 内のノワール配色の具体的なCSS値
- ReactFlowのハンドル非表示・選択スタイルの具体的な実装方法
- Tailwind カスタムカラーの変数命名規則
- フォントのインポート方法（@fontsource vs Google Fonts CDN）
- リセットボタンの具体的なサイズ・余白

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<canonical_refs>

## Canonical References

### デザイン仕様

- `.planning/PROJECT.md` §デザイン仕様 — カラーパレット全11色の定義、フォント指定（Playfair Display, Noto Serif JP, Noto Sans JP）

### 要件定義

- `.planning/REQUIREMENTS.md` — RESET-01, RESET-02, VIS-01, VIS-02, VIS-03 の要件定義
- `.planning/ROADMAP.md` — Phase 4 のゴール、成功基準、プラン構成（04-01, 04-02）

### 先行フェーズの決定事項

- `.planning/phases/02-memo-interaction/02-CONTEXT.md` — メモカード表示仕様（D-01: 固定幅、D-04: Phase 4でノワール仕上げ、D-07: 編集区別は最低限）
- `.planning/phases/03-persistence/03-CONTEXT.md` — localStorage保存・復元の実装（saveMemos/loadMemos）

### 既知の注意点

- `.planning/STATE.md` §Blockers/Concerns — deleteKeyCode={null}、textareaのstopPropagation、@xyflow/react/dist/base.cssのインポート順序

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/features/canvas/ui/MemoCanvas.tsx` — `setNodes` を持っている。リセット時に `setNodes([])` を呼べるようコールバックを公開する必要あり
- `src/features/canvas/model/storage.ts` — `saveMemos([])` または `localStorage.removeItem()` でlocalStorageクリア
- `src/shared/ui/Button/Button.tsx` — shadcn Button コンポーネント（CVAバリアント付き）。リセットボタンに使用可能
- `src/shared/lib/utils.ts` — `cn()` ユーティリティ（Tailwindクラス結合）
- `src/app/styles/index.css` — Tailwindテーマ定義。ノワールカスタムカラーをここに追加する

### Established Patterns

- Feature-Sliced Design: `features/canvas/` にキャンバス関連ロジック集約
- shadcn コンポーネントは `bun run ui:add` で追加 → `src/shared/ui/` に配置
- 公開APIは `index.ts` 経由でエクスポート
- `@/*` エイリアスによるクロスレイヤーインポート

### Integration Points

- `src/features/canvas/ui/MemoCanvas.tsx` — ReactFlowにコントロール非表示設定を追加。リセット用の `setNodes` アクセスを公開
- `src/features/canvas/ui/MemoNode.tsx` — カード背景・ボーダー・テキスト色・フォントをノワールパレットに変更
- `src/pages/canvas/ui/CanvasPage.tsx` — 背景色を `bg-neutral-950` から Noir Black に変更。リセットボタンの固定配置レイヤーを追加
- `src/app/styles/index.css` — ノワールカスタムカラー定義、フォントインポート追加

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 04-reset-and-visual-design_
_Context gathered: 2026-03-21_
