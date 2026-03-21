# Phase 1: Canvas Foundation - Research

**Researched:** 2026-03-21
**Domain:** @xyflow/react v12, dependency cleanup, FSD canvas feature setup
**Confidence:** HIGH

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Convex（`convex`）、Clerk（`@clerk/react`, `@clerk/testing`）、Cloudflare（`@cloudflare/vite-plugin`, `wrangler`）、`next-themes` を完全削除する
- **D-02:** `wouter`（ルーター）をパッケージごと削除する — 単一ページアプリのためルーティング不要
- **D-03:** `@dotenvx/dotenvx` を削除する — Convex/Clerk用の環境変数管理で、メモアプリでは不要
- **D-04:** `@fontsource-variable/noto-sans` を削除する — メモアプリではNoto Sans JP（別パッケージ）を使用予定
- **D-05:** `valibot`、`ts-pattern` は残す — Phase 3以降で使用予定
- **D-06:** `src/shared/ui/` のshadcnコンポーネント（Button, Input, Field, Label, Item, Separator, Skeleton）はすべて残す — 害がなく、後のPhaseで使う可能性がある
- **D-07:** `src/features/todo/` を機能コード・テストファイルともに完全削除する
- **D-08:** `src/shared/api/convex/` を完全削除する
- **D-09:** `src/widgets/header/` を削除する（Clerkに依存）
- **D-10:** Todoのブラウザテストは削除するが、`playwright.config.ts` は残す（Phase 2以降のE2Eテスト用）
- **D-11:** `src/app/routes/routes.tsx` のRoutes層は維持し、Clerk認証ロジックのみ削除する
- **D-12:** `ReactFlowProvider` はキャンバスを使うコンポーネント内にローカル配置する（グローバルプロバイダーにしない）
- **D-13:** `src/pages/home/` を `src/pages/canvas/` にリネームする — ドメインに合った命名
- **D-14:** キャンバス機能は `src/features/canvas/` に配置する — ReactFlow設定、nodeTypes定義、キャンバス関連ロジックをここに集約

### Claude's Discretion

- Phase 1時点でのキャンバス暫定スタイル（最低限の暗い背景を適用予定、Phase 4で本格ノワール調に仕上げる）
- vite.config.ts からのCloudflareプラグイン削除後の設定
- エントリポイント（app/index.tsx）のプロバイダー階層の最終形
- `.env.dev` / `.env.prod` の扱い

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>

## Phase Requirements

| ID        | Description                                                  | Research Support                                                                                                        |
| --------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| CANVAS-01 | @xyflow/react によるビューポート全画面キャンバスが表示される | ReactFlow コンポーネントを width/height 100vw/100vh の親要素内に配置。@xyflow/react/dist/style.css のインポートが必須。 |
| CANVAS-02 | キャンバスをドラッグでパンできる                             | ReactFlow の `panOnDrag` はデフォルト `true` のため追加設定不要。                                                       |
| CANVAS-03 | スクロールでズームイン・アウトできる                         | ReactFlow の `zoomOnScroll` はデフォルト `true` のため追加設定不要。                                                    |

</phase_requirements>

## Summary

Phase 1 は大きく「不要依存の除去」と「@xyflow/react キャンバスの初期構築」の2タスクで構成される。依存除去は package.json の変更に加え、インポートしている既存コードを連動して削除・置換する作業を伴う。キャンバス構築は @xyflow/react v12.10.1 の標準的な初期化パターンに従えばよく、技術的な難易度は低い。

最も重要な落とし穴は2つ：(1) `nodeTypes` をコンポーネント外のモジュールレベル定数として定義しないと毎レンダーでノードがリマウントされる、(2) `@xyflow/react/dist/base.css` のインポートを CSS の先頭（Tailwind preflight より前）に置かないと Tailwind の reset と競合する可能性がある。これらは STATE.md に記録済みの既知懸念事項と一致する。

Phase 1 終了時点では最小限の暗い背景スタイルのみ適用し、ノワール調の本格スタイリングは Phase 4 に委ねる。ReactFlow のデフォルト（白背景、グリッドなし）をダーク背景で上書きする Tailwind クラスを CanvasPage で適用するのが最もシンプルな方針。

**Primary recommendation:** `nodeTypes` をモジュールレベル定数として `src/features/canvas/ui/` に定義し、`ReactFlowProvider` を `CanvasPage` にローカル配置したうえで、`@xyflow/react/dist/base.css` を CSS インポート順序の最初に追加する。

---

## Standard Stack

### Core

| Library       | Version | Purpose                                    | Why Standard                                                 |
| ------------- | ------- | ------------------------------------------ | ------------------------------------------------------------ |
| @xyflow/react | 12.10.1 | キャンバス実装（ノード配置・パン・ズーム） | プロジェクト仕様指定。ノードドラッグ・配置が主要機能と一致。 |

### Supporting（既存・継続利用）

| Library     | Version | Purpose           | When to Use                        |
| ----------- | ------- | ----------------- | ---------------------------------- |
| react       | 19.2.4  | UI フレームワーク | そのまま継続                       |
| tailwindcss | 4.2.2   | スタイリング      | キャンバス背景の暫定スタイルに使用 |
| vite        | 8.0.1   | ビルドツール      | Cloudflare プラグイン削除後も継続  |

### Alternatives Considered

| Instead of                  | Could Use                    | Tradeoff                                                                                                                                               |
| --------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| @xyflow/react/dist/base.css | @xyflow/react/dist/style.css | style.css はフルスタイル（ReactFlow デフォルト UI 全体）。base.css は最小限のレイアウト CSS のみ。Phase 1 の暫定スタイルフェーズでは base.css が適切。 |

**Installation:**

```bash
bun add @xyflow/react
```

**Version verification:** `npm view @xyflow/react version` → `12.10.1`（2026-02-19 公開）

---

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── index.tsx            # ClerkProvider/ConvexProvider を削除、ErrorBoundary + Routes のみ
│   ├── routes/
│   │   └── routes.tsx       # 認証ロジック削除 → CanvasPage を直接レンダー
│   └── styles/
│       └── index.css        # @xyflow/react/dist/base.css を先頭に追加
├── pages/
│   └── canvas/              # (home → canvas リネーム)
│       ├── ui/
│       │   └── CanvasPage.tsx   # ReactFlowProvider ローカル配置、full-viewport
│       └── index.ts
├── features/
│   └── canvas/              # 新規作成
│       ├── ui/
│       │   └── MemoCanvas.tsx   # ReactFlow コンポーネント、nodeTypes 参照
│       ├── model/
│       │   └── node-types.ts    # nodeTypes モジュールレベル定数（★）
│       └── index.ts
└── shared/
    └── ui/                  # shadcn コンポーネント群（そのまま残す）
```

### Pattern 1: ReactFlowProvider ローカル配置

**What:** `ReactFlowProvider` を CanvasPage コンポーネント内に直接ラップする
**When to use:** 単一ページアプリで複数フローなし。グローバル配置は不要。

```tsx
// Source: https://reactflow.dev/api-reference/react-flow-provider
// src/pages/canvas/ui/CanvasPage.tsx
import { ReactFlowProvider } from "@xyflow/react";
import { MemoCanvas } from "@/features/canvas";

export const CanvasPage = () => {
  return (
    <div className="size-full bg-neutral-950">
      <ReactFlowProvider>
        <MemoCanvas />
      </ReactFlowProvider>
    </div>
  );
};
```

### Pattern 2: nodeTypes モジュールレベル定数

**What:** `nodeTypes` を React コンポーネント関数の外（モジュールスコープ）で定義する
**When to use:** 常に。コンポーネント内で定義すると毎レンダーで参照が変わり、ノードがリマウントされる。

```tsx
// Source: https://reactflow.dev/learn/customization/custom-nodes
// src/features/canvas/model/node-types.ts
import type { NodeTypes } from "@xyflow/react";
// Phase 2 でメモノードを追加予定。Phase 1 時点では空オブジェクト or プレースホルダー。
export const NODE_TYPES = {} satisfies NodeTypes;

// src/features/canvas/ui/MemoCanvas.tsx
import { ReactFlow } from "@xyflow/react";
import { NODE_TYPES } from "../model/node-types";

// nodeTypes は必ずモジュールレベル定数を参照
export const MemoCanvas = () => {
  return (
    <ReactFlow
      nodes={[]}
      edges={[]}
      nodeTypes={NODE_TYPES}
      // panOnDrag・zoomOnScroll はデフォルト true のため省略可
    />
  );
};
```

### Pattern 3: CSS インポート順序

**What:** `@xyflow/react/dist/base.css` を Tailwind より先にインポートする
**When to use:** Tailwind v4 の preflight（CSS reset）と base.css の競合を防ぐため。

```css
/* src/app/styles/index.css — 先頭に追加 */
@import "@xyflow/react/dist/base.css"; /* ← 最初 */
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";
/* @import "@fontsource-variable/noto-sans"; ← D-04 で削除 */
```

### Anti-Patterns to Avoid

- **nodeTypes をコンポーネント内インライン定義:** 毎レンダーでオブジェクト参照が変わり、全ノードが再マウントされる。必ずモジュールレベル定数にする。
- **親要素の高さ未設定:** ReactFlow は親要素の width/height に依存する。`size-full`（= `width: 100%; height: 100%`) が親に伝播する HTML/body の高さ設定が必要。
- **style.css と base.css の混在:** どちらか一方のみインポートする。両方インポートするとスタイルが重複する。

---

## Don't Hand-Roll

| Problem              | Don't Build                      | Use Instead                                     | Why                                                                |
| -------------------- | -------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------ |
| キャンバスのパン操作 | マウスイベントでビューポート移動 | @xyflow/react `panOnDrag`（デフォルト true）    | ピクセル計算・境界処理・スムーズ慣性を自前で実装するのは膨大な工数 |
| キャンバスのズーム   | wheel イベント + CSS transform   | @xyflow/react `zoomOnScroll`（デフォルト true） | ズーム中心点の計算、min/max クランプ、アニメーションを内包         |
| ノードの座標管理     | position state + CSS left/top    | @xyflow/react の nodes/onNodesChange            | ドラッグ中の座標更新・衝突検出・z-index を内包                     |

**Key insight:** ReactFlow は「ノード操作に特化したキャンバス」として完成されており、パン・ズーム・ドラッグの基礎部分をすべてカバーしている。独自実装は全て不要。

---

## Common Pitfalls

### Pitfall 1: nodeTypes のインライン定義による無限リマウント

**What goes wrong:** `<ReactFlow nodeTypes={{ memo: MemoNode }} />` のようにコンポーネント内で nodeTypes を定義すると、レンダーのたびに新しいオブジェクト参照が生成され、ReactFlow がノード型変更として検知して全ノードをリマウントする。
**Why it happens:** React は参照の同一性でオブジェクトを比較するため、毎回 `{}` が別オブジェクトになる。
**How to avoid:** `nodeTypes` をファイルのモジュールスコープで `const NODE_TYPES = { ... }` として定義し、コンポーネントの外に置く。
**Warning signs:** ノードの入力フォーカスが突然失われる、ノードが明滅する、パフォーマンスが極端に悪い。

### Pitfall 2: @xyflow/react/dist/base.css と Tailwind preflight の競合

**What goes wrong:** `base.css` を Tailwind の `@import "tailwindcss"` より後にインポートすると、Tailwind の preflight（CSS reset）が base.css の一部スタイルを上書きし、エッジやコントロールの表示が崩れる可能性がある。
**Why it happens:** Tailwind v4 の `@import "tailwindcss"` には preflight が含まれており、後続の CSS より優先度が高くなる場合がある。
**How to avoid:** `@import "@xyflow/react/dist/base.css"` を `index.css` の最初の行に置く。
**Warning signs:** ReactFlow のデフォルトコントロール（ズームボタン等）の見た目が崩れる。

### Pitfall 3: app/index.tsx の `as string` キャスト残留

**What goes wrong:** 現在の `app/index.tsx` は `import.meta.env.VITE_CONVEX_URL as string` のように `as` キャストを使っている。削除後に env 変数参照が残ったままだと型エラーになる。
**Why it happens:** `as` はプロジェクトの TypeScript 規約で禁止されている（writing-typescript スキル）。
**How to avoid:** Convex/Clerk 削除時に env 変数参照も同時に全て削除する。`app/index.tsx` は `StrictMode + ErrorBoundary + Routes` のみのシンプルな形にする。
**Warning signs:** `bun run typecheck` で `TS2339` または `TS2352` エラーが出る。

### Pitfall 4: widgets/header の参照が routes.tsx や HomePage に残留

**What goes wrong:** `src/widgets/header/` を削除しても、`routes.tsx` や `HomePage.tsx` でインポートしていれば TypeScript エラーになる。
**Why it happens:** 削除順序の問題。使用側を先に修正せずにファイルを削除すると broken import が残る。
**How to avoid:** ファイル削除前に使用側コード（routes.tsx, HomePage.tsx 相当）を先に修正する。または削除と置換を同一タスク内で完結させる。
**Warning signs:** `bun run typecheck` で `TS2307 Cannot find module '@/widgets/header'` エラー。

### Pitfall 5: 親要素の height 不足による ReactFlow の表示崩れ

**What goes wrong:** ReactFlow は親要素の高さが確定していないと正しく描画されない。`h-screen` または `h-full` の連鎖（html → body → #root → CanvasPage）が途切れると高さ 0 になる。
**Why it happens:** ReactFlow は内部で親要素の bounding rect を取得してサイズを計算する。
**How to avoid:** `html`, `body`, `#root` の全てに `height: 100%` を設定する（既存の `index.css` の `@layer base` に `html { @apply h-full }` `body { @apply h-full }` が既に存在するため問題ないが、`#root` の設定を確認する）。
**Warning signs:** キャンバスが表示されない、または非常に小さな領域にしか表示されない。

---

## Code Examples

Verified patterns from official sources:

### Full-Viewport Canvas の最小構成

```tsx
// Source: https://reactflow.dev/learn/getting-started/installation-and-requirements
// src/features/canvas/ui/MemoCanvas.tsx

import "@xyflow/react/dist/base.css";
import { ReactFlow } from "@xyflow/react";
import { NODE_TYPES } from "../model/node-types";

export const MemoCanvas = () => {
  return (
    <ReactFlow
      nodes={[]}
      edges={[]}
      nodeTypes={NODE_TYPES}
      // panOnDrag: true (default) — ドラッグでパン
      // zoomOnScroll: true (default) — スクロールでズーム
    />
  );
};
```

### シンプル化後の app/index.tsx

```tsx
// src/app/index.tsx
import "./styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "@/app/providers/ErrorBoundary";
import { Routes } from "./routes";

const rootElement = document.getElementById("root");
if (rootElement === null) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <Routes />
    </ErrorBoundary>
  </StrictMode>,
);
```

注: 現行コードの `document.getElementById("root")!` は非null アサーション `!` を使用しており、プロジェクトの TypeScript 規約違反。削除のついでに修正する。

### シンプル化後の routes.tsx

```tsx
// src/app/routes/routes.tsx
import { CanvasPage } from "@/pages/canvas";

export const Routes = () => {
  return <CanvasPage />;
};
```

### package.json スクリプトのクリーンアップ対象

削除するパッケージに依存するスクリプトも整理が必要：

- `"cf-typegen": "wrangler types"` → 削除（wrangler 削除後）
- `"check": "bun typecheck && bun run build && wrangler deploy --dry-run"` → wrangler 部分を削除
- `"deploy": "wrangler deploy"` → 削除
- `"dev": "dotenvx run -f .env.dev -- vite"` → `"vite"` のみに変更（dotenvx 削除後）
- `"preview": "dotenvx run -f .env.dev -- ..."` → dotenvx 部分を削除
- `"test": "vitest --project unit & vitest --project browser & dotenvx run -f .env.dev -- bun run playwright test"` → dotenvx 部分を削除

---

## State of the Art

| Old Approach                            | Current Approach                               | When Changed | Impact                                                                          |
| --------------------------------------- | ---------------------------------------------- | ------------ | ------------------------------------------------------------------------------- |
| `reactflow` パッケージ                  | `@xyflow/react` パッケージ                     | v12 (2024)   | import パスが変わる。`import { ReactFlow } from '@xyflow/react'`                |
| `reactflow/dist/style.css`              | `@xyflow/react/dist/base.css` or `style.css`   | v12 (2024)   | base.css は最小 CSS のみ、style.css はフル UI                                   |
| `node.width` / `node.height` (measured) | `node.measured.width` / `node.measured.height` | v12          | 実測値は `node.measured` に格納。`node.width/height` はインラインスタイル指定用 |
| `parentNode`                            | `parentId`                                     | v12          | ネスト構造のノードで使用する場合                                                |

**Deprecated/outdated:**

- `import ReactFlow from 'reactflow'` (default import): v12 から named import のみ。`import { ReactFlow } from '@xyflow/react'`
- `getTransformForBounds`: v12 で削除。`getViewportForBounds` を使用。

---

## Open Questions

1. **`#root` 要素への height 設定**
   - What we know: `html` と `body` には `h-full` が適用済み（`index.css` の `@layer base` で確認）
   - What's unclear: `div#root` に明示的な `height: 100%` または `h-full` が設定されているか。`index.html` または CSS で確認が必要。
   - Recommendation: Plan 01-02 で `index.html` の `#root` div に `style="height:100%"` または CSS で `#root { height: 100% }` を追加することを検討する。

2. **`@xyflow/react/dist/base.css` のインポート場所**
   - What we know: CSS ファイル（`index.css`）に追加する方法とコンポーネント内で直接 import する方法がある。
   - What's unclear: Vite + Tailwind v4 環境で `index.css` への `@import` として追加した場合、`@tailwindcss/vite` プラグインとの処理順序が正しく担保されるか。
   - Recommendation: `src/features/canvas/ui/MemoCanvas.tsx` でコンポーネントファイルの先頭に `import "@xyflow/react/dist/base.css"` として直接インポートする方法が最も確実。Vite は CSS import をバンドル時に適切に処理する。

---

## Sources

### Primary (HIGH confidence)

- https://reactflow.dev/learn/getting-started/installation-and-requirements — インストール、必須 CSS、最小構成
- https://reactflow.dev/api-reference/react-flow — ReactFlow コンポーネント props 一覧
- https://reactflow.dev/learn/concepts/the-viewport — パン・ズームのデフォルト動作
- https://reactflow.dev/learn/customization/custom-nodes — nodeTypes モジュールレベル定数パターン
- https://reactflow.dev/api-reference/react-flow-provider — ReactFlowProvider のローカル配置
- https://reactflow.dev/learn/troubleshooting/migrate-to-v12 — v12 の破壊的変更
- `npm view @xyflow/react version` — v12.10.1（2026-02-19）を直接確認

### Secondary (MEDIUM confidence)

- STATE.md §Blockers/Concerns — nodeTypes モジュールレベル定数、base.css インポート順序（プロジェクト内に記録済みの知見）

### Tertiary (LOW confidence)

- なし

---

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — npm registry で v12.10.1 を直接確認、公式ドキュメントで API を確認
- Architecture: HIGH — 公式ドキュメントの nodeTypes パターン + FSD スキルルールに基づく
- Pitfalls: HIGH — 公式ドキュメント + STATE.md の既知懸念事項と一致

**Research date:** 2026-03-21
**Valid until:** 2026-06-21（@xyflow/react は安定版。30日以上有効）
