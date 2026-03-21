# Phase 4: Reset and Visual Design - Research

**Researched:** 2026-03-21
**Domain:** shadcn AlertDialog, @fontsource font installation, @xyflow/react CSS variable theming, Tailwind v4 custom color tokens
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** リセットボタンはアイコン＋テキストの組み合わせ（lucide-react アイコン + 「リセット」ラベル）
- **D-02:** 画面右上に固定配置（VIS-03）
- **D-03:** ノワール配色に溶け込むスタイル
- **D-04:** 確認ダイアログの文言は「すべてのメモを削除しますか？」
- **D-05:** ボタンラベルは「削除」「キャンセル」
- **D-06:** shadcn AlertDialog のデフォルトスタイルをノワール配色に合わせる（凝った装飾は不要）
- **D-07:** 確認後に `setNodes([])` で全ノード削除 + localStorage クリア
- **D-08:** キャンセル時はメモをそのまま維持
- **D-09:** メモカード背景を Old Paper (`#f5ede0`) 単色に変更
- **D-10:** ボーダーを Aged Wood (`#3d2e1e`) の細いボーダーに変更
- **D-11:** 編集モードの視覚的区別は最低限（テキストエリアの存在自体が区別）
- **D-12:** テキスト色を Ink Black (`#2a1f14`) に変更
- **D-13:** メモ本文は `font-family: "Playfair Display", "Noto Serif JP", serif` のスタック（仕様通り）
- **D-14:** UIテキスト全般（リセットボタン、ダイアログ等）は Noto Sans JP
- **D-15:** キャンバス背景は Noir Black (`#1a1108`) 単色 — パターンなし
- **D-16:** ReactFlowのUIコントロール（ズームボタン等）はすべて非表示
- **D-17:** ReactFlowのハンドル（接続ポイント）は非表示、選択ハイライトもノワール調に合わせる
- **D-18:** ノワールパレット全色を Tailwind カスタムカラーとして `index.css` に定義し、プロジェクト全体で再利用可能にする

### Claude's Discretion

- リセットボタンの具体的なアイコン選択（lucide-react から）
- AlertDialog 内のノワール配色の具体的なCSS値
- ReactFlowのハンドル非表示・選択スタイルの具体的な実装方法
- Tailwind カスタムカラーの変数命名規則
- フォントのインポート方法（@fontsource vs Google Fonts CDN）
- リセットボタンの具体的なサイズ・余白

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>

## Phase Requirements

| ID       | Description                                                                   | Research Support                                                                                                                |
| -------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| RESET-01 | リセットボタンで全メモを一括削除できる                                        | `setNodes([])` + `saveMemos([])` パターン確認済み。MemoCanvas から setNodes コールバックを props/context 経由で公開する必要あり |
| RESET-02 | リセット実行前に確認ダイアログが表示される                                    | shadcn AlertDialog コンポーネントの追加が必要（`bun run ui:add alert-dialog`）。未インストール確認済み                          |
| VIS-01   | ダークノワール調カラーパレットが適用されている                                | Tailwind v4 `@theme inline` ブロックでカスタムカラー定義。`index.css` に追加する方式確認済み                                    |
| VIS-02   | 指定フォント（Playfair Display, Noto Serif JP, Noto Sans JP）が適用されている | `@fontsource-variable/*` パッケージ3点が未インストール。`bun add` + `@import` で導入する                                        |
| VIS-03   | リセットボタンが右上に固定表示されている                                      | CanvasPage の `relative` コンテナ内に `absolute top-4 right-4` で固定配置（ReactFlow の z-index の上に重ねる）                  |

</phase_requirements>

## Summary

Phase 4 は2つの独立した作業からなる。1つ目は ResetButton 機能の実装（shadcn AlertDialog + setNodes([]) + localStorage クリア）、2つ目はノワールビジュアルデザインの全面適用（カラーパレット、フォント、ReactFlow UI非表示）。

技術的な複雑さは低い。既存の MemoCanvas/storage.ts のパターンに乗れる部分が多く、主な課題は (a) MemoCanvas の `setNodes` を CanvasPage に公開するインターフェース設計、(b) @xyflow/react の CSS カスタムプロパティを正しく上書きすること、(c) フォントパッケージ3点のインストールと CSS @import 設定の3点に絞られる。

**Primary recommendation:** MemoCanvas に `onReset` コールバック prop を追加し CanvasPage から setNodes([]) + saveMemos([]) を起動する設計が最もシンプル。AlertDialog は shadcn コンポーネントとして `src/shared/ui/AlertDialog/` に配置し、ResetButton feature は `src/features/reset/` に FSD スライスとして作成する。

## Standard Stack

### Core

| Library                               | Version             | Purpose                       | Why Standard                                                                               |
| ------------------------------------- | ------------------- | ----------------------------- | ------------------------------------------------------------------------------------------ |
| shadcn AlertDialog                    | CLI component       | 確認ダイアログ UI             | プロジェクト既定の shadcn ベース。Radix UI の AccessibilityダイアログをCVAスタイルで包む   |
| @fontsource-variable/playfair-display | 5.2.8               | Playfair Display 可変フォント | self-hosted、Google Fonts CDN 不要、Vite バンドル最適化可能                                |
| @fontsource-variable/noto-serif-jp    | 5.2.9               | Noto Serif JP 可変フォント    | 同上                                                                                       |
| @fontsource-variable/noto-sans-jp     | 5.2.10              | Noto Sans JP 可変フォント     | 同上（CLAUDE.md の `@fontsource-variable/noto-sans` とは別パッケージ — JP variant が必要） |
| lucide-react                          | 0.577.0 (installed) | リセットボタンアイコン        | 既インストール済み                                                                         |

### Supporting

| Library                     | Version             | Purpose                      | When to Use                                         |
| --------------------------- | ------------------- | ---------------------------- | --------------------------------------------------- |
| @xyflow/react CSS variables | 12.10.1 (installed) | ハンドル・選択枠のノワール化 | カスタム CSS クラスで `--xy-*` 変数を上書きするとき |

**Installation (new packages only):**

```bash
bun add @fontsource-variable/playfair-display @fontsource-variable/noto-serif-jp @fontsource-variable/noto-sans-jp
```

**shadcn AlertDialog installation:**

```bash
bun run ui:add alert-dialog
```

→ `src/shared/ui/AlertDialog/` に配置される（プロジェクトの ui:organize スクリプトまたは手動移動が必要な場合あり）

**Version verification (confirmed 2026-03-21):**

- `@fontsource-variable/playfair-display`: 5.2.8
- `@fontsource-variable/noto-serif-jp`: 5.2.9
- `@fontsource-variable/noto-sans-jp`: 5.2.10
- `@xyflow/react`: 12.10.1 (installed)
- `lucide-react`: 0.577.0 (installed)

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/styles/index.css         # ノワールカスタムカラー + フォント @import 追加
├── features/reset/              # 新スライス (FSD)
│   ├── ui/
│   │   └── ResetButton.tsx      # AlertDialog + Button 組み合わせ
│   └── index.ts                 # public API: export { ResetButton }
├── features/canvas/             # 既存スライス — 変更あり
│   ├── ui/
│   │   ├── MemoCanvas.tsx       # onReset prop 追加、ReactFlow controls/handles 非表示
│   │   └── MemoNode.tsx         # ノワールカラー + フォント適用
│   └── model/storage.ts        # 変更なし（saveMemos([]) で localStorage クリア可能）
├── pages/canvas/ui/CanvasPage.tsx  # Noir Black 背景、ResetButton の固定配置
└── shared/ui/AlertDialog/       # shadcn UI add で生成
    ├── AlertDialog.tsx
    └── index.ts
```

### Pattern 1: ResetButton に onReset コールバックを渡すアーキテクチャ

**What:** MemoCanvas が `onReset?: () => void` prop を受け取り、CanvasPage が setNodes([]) + saveMemos([]) の実装を提供する

**When to use:** ReactFlow のステートは ReactFlowProvider 内で管理されるため、外部から setNodes を呼ぶには props 経由が最もシンプル

**Example:**

```typescript
// src/features/canvas/ui/MemoCanvas.tsx
type Props = {
  onReset?: () => void;
};

export const MemoCanvas = ({ onReset }: Props) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<MemoNode>(loadMemos());
  // ...

  const handleReset = useCallback(() => {
    setNodes([]);
    saveMemos([]);
    onReset?.();
  }, [setNodes, onReset]);

  return (
    <ReactFlow
      // ...
      nodesConnectable={false}
      nodesFocusable={false}
    />
  );
};
```

**Alternative:** MemoCanvas 自身に `resetNodes` 関数を持たせ、`useImperativeHandle` で公開する方法もあるが、props コールバックの方が FSD のシンプルなデータフローに合う。

### Pattern 2: Tailwind v4 カスタムカラートークン定義

**What:** `index.css` の `@theme inline` ブロック内に `--color-noir-*` 変数を追加し、Tailwind クラスとして使用可能にする

**When to use:** プロジェクト全体で再利用するカラーパレットを管理するとき（D-18）

**Example:**

```css
/* src/app/styles/index.css */
@theme inline {
  /* 既存の --color-* 変数の後に追加 */
  --color-noir-black: #1a1108;
  --color-noir-dark-walnut: #2a1f14;
  --color-noir-aged-wood: #3d2e1e;
  --color-noir-dusty-ash: #8a7a6a;
  --color-noir-old-paper: #f5ede0;
  --color-noir-worn-parchment: #e8d9c4;
  --color-noir-ink-black: #2a1f14;
  --color-noir-faded-ink: #5c3d1e;
  --color-noir-brass: #c8a96e;
  --color-noir-crimson: #8b2020;
  --color-noir-bottle-green: #4a6741;
}
```

使用例: `bg-noir-black`, `border-noir-aged-wood`, `text-noir-ink-black`

**注意:** Tailwind v4 の `@theme inline` は CSS カスタムプロパティを Tailwind ユーティリティとして自動展開する。`--color-*` プレフィックスが `bg-*`, `text-*`, `border-*` クラスとして使えるようになる。

### Pattern 3: @fontsource-variable フォントのインポートと適用

**What:** `@fontsource-variable/*` パッケージをインポートして CSS font-family を設定する

**Example:**

```css
/* src/app/styles/index.css — @import ブロックの直後に追加 */
@import "@fontsource-variable/playfair-display";
@import "@fontsource-variable/noto-serif-jp";
@import "@fontsource-variable/noto-sans-jp";

/* @theme inline ブロック内 */
@theme inline {
  --font-sans: "Noto Sans JP", sans-serif;
  --font-serif: "Playfair Display", "Noto Serif JP", serif;
}
```

MemoNode でのフォント適用:

```tsx
// MemoNode.tsx — テキスト要素に font-serif を追加
<p className="whitespace-pre-wrap font-serif text-noir-ink-black">{data.content || " "}</p>
<textarea className="font-serif ..." />
```

### Pattern 4: @xyflow/react ハンドル非表示と選択スタイルのノワール化

**What:** CSS カスタムプロパティで ReactFlow の選択枠・ハンドルスタイルを上書きする

**Example:**

```css
/* index.css @layer base または直接記述 */
.react-flow__handle {
  display: none;
}

/* 選択枠をノワール調に */
.react-flow__nodesselection-rect {
  --xy-selection-background-color: rgba(200, 169, 110, 0.1); /* Brass 透過 */
  --xy-selection-border: 1px dotted #c8a96e; /* Brass */
}
```

または ReactFlow の `nodesConnectable={false}` prop でハンドルを非機能化し、CSS で `display: none` して完全非表示にする。

### Pattern 5: ResetButton の fixed 配置

**What:** CanvasPage 内で z-index を考慮した固定配置レイヤーを作る

**When to use:** ReactFlow のキャンバスは `position: absolute` で全画面を占めるため、上に重ねるレイヤーが必要

**Example:**

```tsx
// src/pages/canvas/ui/CanvasPage.tsx
export const CanvasPage = () => {
  return (
    <div className="relative size-full bg-noir-black">
      <ReactFlowProvider>
        <MemoCanvas />
      </ReactFlowProvider>
      {/* ReactFlow の上に重ねる固定UIレイヤー */}
      <div className="pointer-events-none absolute inset-0 z-10">
        <div className="pointer-events-auto absolute right-4 top-4">
          <ResetButton onReset={handleReset} />
        </div>
      </div>
    </div>
  );
};
```

**注意:** `pointer-events-none` + `pointer-events-auto` パターンで、オーバーレイがキャンバス操作を妨げない。

### Anti-Patterns to Avoid

- **AlertDialog を MemoCanvas 内に置く:** MemoCanvas は ReactFlow コンテキスト内で動くため、ダイアログは外側（pages/canvas またはfeatures/reset）に置く
- **setNodes を Context で共有する:** ReactFlow の useReactFlow() フックは ReactFlowProvider 内でのみ有効。Provider 外から直接 setNodes にアクセスしようとすると失敗する
- **font-family をインライン style で指定する:** Tailwind の font-sans/font-serif ユーティリティクラスを使うことで、`@theme inline` の変数変更が一か所で効く
- **@fontsource-variable ではなく @fontsource（non-variable）を使う:** 可変フォントの方がファイルサイズが小さく、フォントウェイトを自由に選べる

## Don't Hand-Roll

| Problem               | Don't Build                       | Use Instead                                   | Why                                                                           |
| --------------------- | --------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------- |
| 確認ダイアログ        | カスタム modal + backdrop         | shadcn AlertDialog                            | Radix UI の Accessibility（フォーカストラップ、ESC キー、ARIA）が組み込み済み |
| フォント self-hosting | フォントファイルを public/ に配置 | @fontsource-variable パッケージ               | npm 管理、キャッシュ最適化、Vite バンドル対応、サブセット対応                 |
| カラートークン管理    | JS 定数ファイルに色を列挙         | Tailwind @theme inline CSS カスタムプロパティ | Tailwind クラスと直接統合、ブラウザ devtools で確認可能                       |

**Key insight:** shadcn AlertDialog は特に重要。「確認→削除」フローの Accessibility（フォーカス管理、キーボード操作、スクリーンリーダー）をすべて自動で処理する。

## Common Pitfalls

### Pitfall 1: @xyflow/react の base.css インポート順序

**What goes wrong:** base.css を Tailwind の後にインポートすると、ReactFlow のスタイルが Tailwind preflight を上書きして UI が崩れる
**Why it happens:** CSS カスケード順序の問題
**How to avoid:** 既存のインポート順序を維持する — `@import "@xyflow/react/dist/base.css"` は必ず最初の行
**Warning signs:** メモカードのサイズや border-box が意図と異なって見える

### Pitfall 2: setNodes を ReactFlowProvider 外から呼べない

**What goes wrong:** ResetButton から直接 `useReactFlow().setNodes` を呼ぼうとすると「ReactFlowProvider not found」エラーが出る
**Why it happens:** `useReactFlow` は ReactFlowProvider の React Context に依存している
**How to avoid:** ResetButton は Provider 外（CanvasPage）に配置し、MemoCanvas に `onReset` コールバックを渡す。MemoCanvas 内で setNodes([]) を実行する
**Warning signs:** "useReactFlow must be used within a ReactFlowProvider" エラー

### Pitfall 3: shadcn AlertDialog のスタイルが shadcn CSS 変数を参照する

**What goes wrong:** AlertDialog の背景・テキスト色が期待通りにならない — shadcn は `--background`, `--foreground` などの CSS 変数を使う
**Why it happens:** shadcn コンポーネントはプロジェクトのテーマ変数に依存しており、生の hex 色で指定しない
**How to avoid:** AlertDialog のノワール化は、shadcn CSS 変数 (`--background`, `--foreground`, `--border` など) をルートまたはダイアログスコープで上書きする。または AlertDialog の各要素（Content, Title, Description, Action）に直接 Tailwind クラスでノワールカラーを指定する
**Warning signs:** AlertDialog が白地に黒のまま表示される

### Pitfall 4: @fontsource-variable/noto-sans（英語）と noto-sans-jp（日本語）の違い

**What goes wrong:** `@fontsource-variable/noto-sans` をインポートしても日本語グリフが表示されない
**Why it happens:** `noto-sans` は英語・Latin グリフのみ。日本語には `noto-sans-jp` が必要
**How to avoid:** UIテキストには `@fontsource-variable/noto-sans-jp` をインポートする（CLAUDE.md に記載の `noto-sans` は現在 package.json に存在しない — JP variant が必要）
**Warning signs:** 日本語テキストがフォールバックフォントで表示される

### Pitfall 5: Tailwind v4 カスタムカラーの変数名プレフィックス

**What goes wrong:** `@theme inline` に `--noir-black: #1a1108` と定義しても `bg-noir-black` クラスが使えない
**Why it happens:** Tailwind v4 は `--color-*` プレフィックスのある変数のみをカラーユーティリティとして展開する
**How to avoid:** 必ず `--color-noir-black: #1a1108` のように `--color-` プレフィックスを付ける
**Warning signs:** Tailwind クラスが未定義エラーになる、または透明になる

## Code Examples

### shadcn AlertDialog 基本パターン（インストール後の構造）

```typescript
// Source: shadcn/ui AlertDialog component pattern
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/ui/AlertDialog";

export const ResetButton = ({ onConfirm }: { onConfirm: () => void }) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button>
          <Trash2Icon />
          リセット
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>すべてのメモを削除しますか？</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>削除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

### MemoCanvas に onReset を追加するパターン

```typescript
// src/features/canvas/ui/MemoCanvas.tsx
type Props = {
  onReset?: () => void;
};

export const MemoCanvas = ({ onReset }: Props) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<MemoNode>(loadMemos());

  const handleReset = useCallback(() => {
    setNodes([]);
    saveMemos([]);
    onReset?.();
  }, [setNodes, onReset]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={[]}
      nodeTypes={NODE_TYPES}
      onNodesChange={onNodesChange}
      deleteKeyCode={null}
      zoomOnDoubleClick={false}
      nodesConnectable={false}
      onDoubleClick={handlePaneDoubleClick}
      onNodeDoubleClick={handleNodeDoubleClick}
      onNodeDragStop={handleNodeDragStop}
    />
  );
};
```

### ReactFlow ハンドル非表示と選択スタイルのノワール CSS

```css
/* src/app/styles/index.css の @layer base 内 */
.react-flow__handle {
  display: none;
}

/* ノード選択枠をノワール調に（デフォルトの青みがかったグレーを置き換え） */
.react-flow__nodesselection-rect {
  border: 1px dotted #c8a96e !important; /* Brass */
  background: rgba(200, 169, 110, 0.05) !important;
}
```

または CSS 変数のみで上書き:

```css
.react-flow__pane {
  --xy-selection-background-color: rgba(200, 169, 110, 0.05);
  --xy-selection-border: 1px dotted #c8a96e;
}
```

### @fontsource-variable インポート順序（index.css）

```css
/* 既存の順序を維持しつつフォントを追加 */
@import "@xyflow/react/dist/base.css"; /* 必ず最初 */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
@import "@fontsource-variable/playfair-display";
@import "@fontsource-variable/noto-serif-jp";
@import "@fontsource-variable/noto-sans-jp";
```

## State of the Art

| Old Approach                                    | Current Approach                         | When Changed       | Impact                                             |
| ----------------------------------------------- | ---------------------------------------- | ------------------ | -------------------------------------------------- |
| Google Fonts CDN `<link>`                       | @fontsource-variable npm パッケージ      | ~2020              | self-hosted、offline 対応、Vite バンドル           |
| shadcn/ui Dialog（汎用）                        | shadcn AlertDialog（専用）               | shadcn v1          | 確認用途に最適化された ARIA ロール (`alertdialog`) |
| ReactFlow スタイルのカスタマイズに `style` prop | CSS カスタムプロパティ（`--xy-*`）上書き | @xyflow/react v11+ | テーマ変数が一元管理可能                           |
| Tailwind v3 `theme.extend.colors`               | Tailwind v4 `@theme inline --color-*`    | Tailwind v4        | JS config 不要、CSS のみで管理                     |

## Open Questions

1. **AlertDialog のノワール配色スコープ**
   - What we know: shadcn AlertDialog は `--background`, `--foreground` などを参照する。これらは `:root` に定義されていてダークノワール向けに変更されていない
   - What's unclear: AlertDialog だけにノワール配色を適用するには、(a) AlertDialogContent に直接 Tailwind クラスを指定する、(b) `:root` の shadcn 変数をノワール寄りに変更する、(c) AlertDialog コンポーネント内のクラス定義を書き換える — どの方針が最もメンテしやすいか
   - Recommendation: (a) AlertDialogContent に `bg-noir-dark-walnut text-noir-old-paper border-noir-aged-wood` を直接指定するのが最もシンプル。shadcn コンポーネントの生成コードを編集可能なので、className を直接追加する

2. **CanvasPage から MemoCanvas への setNodes 公開**
   - What we know: `onReset` callback を props で渡す方針が FSD に適合する。MemoCanvas.tsx の既存 props 型に追加するだけ
   - What's unclear: ResetButton は CanvasPage に置くべきか、別フィーチャースライスとして独立させるべきか
   - Recommendation: `features/reset/ui/ResetButton.tsx` に配置。CanvasPage が `onConfirm={handleReset}` を渡す。`handleReset` は CanvasPage 内で MemoCanvas の `onReset` に繋ぐ

## Sources

### Primary (HIGH confidence)

- @xyflow/react dist/base.css (local: node_modules/@xyflow/react/dist/base.css) — CSS カスタムプロパティの一覧（`--xy-handle-*`, `--xy-node-border-*`, `--xy-selection-*` など）確認済み
- @xyflow/react TypeScript types (local: node_modules/@xyflow/react/dist/esm/types/component-props.d.ts) — `nodesConnectable`, `nodesFocusable`, `selectNodesOnDrag` props 確認済み
- package.json (local) — 全依存関係の現在バージョン確認済み
- src/app/styles/index.css (local) — Tailwind v4 `@theme inline` 構文の現行実装確認済み

### Secondary (MEDIUM confidence)

- npm registry (bun info): @fontsource-variable/playfair-display@5.2.8, @fontsource-variable/noto-serif-jp@5.2.9, @fontsource-variable/noto-sans-jp@5.2.10 — 存在とバージョン確認済み
- shadcn/ui AlertDialog component — CLI add で生成される構造は標準パターン。実際の生成コードは `bun run ui:add alert-dialog` 後に確認が必要

### Tertiary (LOW confidence)

- なし

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — 全パッケージを npm registry と node_modules で直接確認
- Architecture: HIGH — 既存コードベースを読んだうえでの設計（MemoCanvas/CanvasPage/FSD パターン準拠）
- Pitfalls: HIGH — base.css のインポート順序と ReactFlowProvider スコープは Phase 1/2 の既知問題として STATE.md に記録済み

**Research date:** 2026-03-21
**Valid until:** 2026-04-21（@fontsource パッケージのマイナーバージョンアップは頻繁だが API 互換性は安定）
