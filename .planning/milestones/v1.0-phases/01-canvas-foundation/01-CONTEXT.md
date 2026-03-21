# Phase 1: Canvas Foundation - Context

**Gathered:** 2026-03-21
**Status:** Ready for planning

<domain>
## Phase Boundary

不要な依存関係（Convex, Clerk, Cloudflare, next-themes等）を削除し、ビューポート全画面の @xyflow/react キャンバスを構築する。パン・ズーム操作が動作し、旧Todo UIが完全に消えた状態がゴール。

</domain>

<decisions>
## Implementation Decisions

### 依存パッケージの整理

- **D-01:** Convex（`convex`）、Clerk（`@clerk/react`, `@clerk/testing`）、Cloudflare（`@cloudflare/vite-plugin`, `wrangler`）、`next-themes` を完全削除する
- **D-02:** `wouter`（ルーター）をパッケージごと削除する — 単一ページアプリのためルーティング不要
- **D-03:** `@dotenvx/dotenvx` を削除する — Convex/Clerk用の環境変数管理で、メモアプリでは不要
- **D-04:** `@fontsource-variable/noto-sans` を削除する — メモアプリではNoto Sans JP（別パッケージ）を使用予定
- **D-05:** `valibot`、`ts-pattern` は残す — Phase 3以降で使用予定

### 既存UIコンポーネントの扱い

- **D-06:** `src/shared/ui/` のshadcnコンポーネント（Button, Input, Field, Label, Item, Separator, Skeleton）はすべて残す — 害がなく、後のPhaseで使う可能性がある

### コード・テストの整理

- **D-07:** `src/features/todo/` を機能コード・テストファイルともに完全削除する
- **D-08:** `src/shared/api/convex/` を完全削除する
- **D-09:** `src/widgets/header/` を削除する（Clerkに依存）
- **D-10:** Todoのブラウザテストは削除するが、`playwright.config.ts` は残す（Phase 2以降のE2Eテスト用）

### アプリ構成

- **D-11:** `src/app/routes/routes.tsx` のRoutes層は維持し、Clerk認証ロジックのみ削除する
- **D-12:** `ReactFlowProvider` はキャンバスを使うコンポーネント内にローカル配置する（グローバルプロバイダーにしない）
- **D-13:** `src/pages/home/` を `src/pages/canvas/` にリネームする — ドメインに合った命名

### FSDレイヤー配置

- **D-14:** キャンバス機能は `src/features/canvas/` に配置する — ReactFlow設定、nodeTypes定義、キャンバス関連ロジックをここに集約

### Claude's Discretion

- Phase 1時点でのキャンバス暫定スタイル（最低限の暗い背景を適用予定、Phase 4で本格ノワール調に仕上げる）
- vite.config.ts からのCloudflareプラグイン削除後の設定
- エントリポイント（app/index.tsx）のプロバイダー階層の最終形
- `.env.dev` / `.env.prod` の扱い

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<canonical_refs>

## Canonical References

### プロジェクト仕様

- `.planning/PROJECT.md` — カラーパレット、タイポグラフィ、データ構造、制約条件の定義
- `.planning/REQUIREMENTS.md` — CANVAS-01〜03の要件定義
- `.planning/ROADMAP.md` — Phase 1のゴール、成功基準、プラン構成

### 既知の注意点

- `.planning/STATE.md` §Blockers/Concerns — nodeTypesのモジュールレベル定数化、base.cssインポート順序

### アーキテクチャ

- `.claude/rules/fsd-architecture.md` — Feature-Sliced Designのレイヤー・スライス・セグメントルール

</canonical_refs>

<code_context>

## Existing Code Insights

### Reusable Assets

- `src/shared/ui/` — shadcn UIコンポーネント群（Button等はPhase 4で使用予定）
- `src/shared/lib/utils.ts` — `cn()` ユーティリティ（Tailwindクラス結合）
- `src/app/providers/ErrorBoundary/` — エラーバウンダリ（継続利用）

### Established Patterns

- FSDディレクトリ構造（app/pages/widgets/features/shared）が確立済み
- shadcnコンポーネントはCVAスタイルバリアント + 個別index.tsパターン
- `@/*` エイリアスによるクロスレイヤーインポート

### Integration Points

- `src/app/index.tsx` — Clerk/Convexプロバイダーの削除とシンプル化
- `src/app/routes/routes.tsx` — 認証ロジック削除、CanvasPageへのルーティング
- `vite.config.ts` — Cloudflareプラグイン削除
- `package.json` — 不要パッケージの削除、スクリプト整理

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

_Phase: 01-canvas-foundation_
_Context gathered: 2026-03-21_
