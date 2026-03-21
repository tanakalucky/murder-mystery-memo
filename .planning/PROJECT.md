# Murder Mystery Memo

## What This Is

マーダーミステリーゲームのプレイ中にリアルタイムでメモを取るためのWebアプリ。探偵のノートをイメージしたダークノワール調のUIで、キャンバス上にメモを自由配置・編集できる。PCブラウザでの使用を想定し、バックエンドは不要でlocalStorageにデータを永続化する。

## Core Value

キャンバス上でメモを直感的に追加・配置・編集でき、ゲームプレイを中断せずに情報を整理できること。

## Requirements

### Validated

- ✓ React + Vite によるSPA基盤 — existing
- ✓ Feature-Sliced Design アーキテクチャ — existing
- ✓ Tailwind CSS v4 によるスタイリング — existing
- ✓ shadcn/ui コンポーネント基盤 — existing
- ✓ Vitest + Playwright テスト基盤 — existing
- ✓ oxlint / oxfmt コード品質ツール — existing
- ✓ @xyflow/react によるキャンバス実装 — v1.0
- ✓ ビューポート全画面のキャンバスレイアウト — v1.0
- ✓ キャンバス上をダブルクリックしてメモを追加できる — v1.0
- ✓ メモ生成と同時に編集状態になりフォーカスが当たる — v1.0
- ✓ Enter で改行、Shift+Enter で編集確定、Escape でキャンセル — v1.0
- ✓ 既存メモをダブルクリックして再編集できる — v1.0
- ✓ メモ外クリックで編集確定 — v1.0
- ✓ メモをドラッグで自由移動できる — v1.0
- ✓ メモのデータ（内容・位置）をlocalStorageに永続化する — v1.0
- ✓ リセットボタンで全メモを一括削除できる（確認ダイアログ付き） — v1.0
- ✓ ダークノワール調のUI（指定カラーパレット・フォント適用） — v1.0

### Active

(Next milestone で定義)

### Out of Scope

- メモ単体の削除 — 仕様上リセット（全削除）のみ
- ツールバー・サイドバー — UIは最小限（リセットボタンのみ）
- バックエンドAPI — フロントエンドのみ、localStorage永続化
- ユーザー認証 — 個人利用、ログイン不要
- リアルタイム同期 — 単一デバイスでの使用
- モバイル対応 — PCブラウザ専用

## Context

### 現在の状態

v1.0 MVP shipped (2026-03-21) — 1,597 LOC (TypeScript/TSX/CSS)。
@xyflow/react キャンバス上でメモの追加・編集・ドラッグ移動・永続化・一括リセットが可能。
ダークノワール調UI（11色パレット + セリフフォント）で探偵のノート風の見た目を実現。

Tech stack: React 19 + Vite 8 + @xyflow/react + Tailwind CSS v4 + shadcn/ui + valibot + bun
Architecture: Feature-Sliced Design

### デザイン仕様

**カラーパレット:**
| 役割 | 名前 | カラーコード |
|------|------|------|
| キャンバス背景 | Noir Black | `#1a1108` |
| サーフェス | Dark Walnut | `#2a1f14` |
| ボーダー・区切り | Aged Wood | `#3d2e1e` |
| ミュートテキスト | Dusty Ash | `#8a7a6a` |
| メモ背景 | Old Paper | `#f5ede0` |
| メモ背景（暗め） | Worn Parchment | `#e8d9c4` |
| メモ本文 | Ink Black | `#2a1f14` |
| メモ本文（薄め） | Faded Ink | `#5c3d1e` |
| プライマリアクセント | Brass | `#c8a96e` |
| 危険・警告 | Crimson | `#8b2020` |
| 確定・完了 | Bottle Green | `#4a6741` |

**タイポグラフィ:**
| 用途 | フォント |
|------|------|
| メモ本文（英数） | Playfair Display |
| メモ本文（日本語） | Noto Serif JP |
| UIテキスト全般 | Noto Sans JP |

### データ構造

```typescript
type Memo = {
  id: string;
  content: string;
  position: { x: number; y: number };
};
```

localStorageに `Memo[]` をシリアライズして保存・復元する。タイムスタンプは不要。

## Constraints

- **Tech stack**: @xyflow/react（React Flow v12）でキャンバス実装 — 仕様指定
- **Tech stack**: localStorage のみでデータ永続化 — バックエンド不要の要件
- **Platform**: PCブラウザ専用 — モバイル対応不要
- **Architecture**: Feature-Sliced Design — 既存アーキテクチャ継続
- **Package manager**: bun — 既存環境継続

## Key Decisions

| Decision                       | Rationale                                                | Outcome    |
| ------------------------------ | -------------------------------------------------------- | ---------- |
| Convex/Clerk を完全削除        | メモアプリにバックエンド・認証は不要                     | ✓ Phase 01 |
| @xyflow/react でキャンバス実装 | ノードのドラッグ・配置が主要機能と一致                   | ✓ Phase 01 |
| localStorage で永続化          | シンプル、バックエンド不要、個人利用に十分               | ✓ Phase 03 |
| Shift+Enter で編集確定         | ゲーム中の操作性を重視、Enter は改行に割当               | ✓ Phase 02 |
| ノワールカラーパレット11色定義 | 探偵のノートをイメージしたダークノワール調UI             | ✓ Phase 04 |
| @base-ui/react AlertDialog採用 | shadcn/ui AlertDialogの代わりにrender propパターンで実装 | ✓ Phase 04 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):

1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):

1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---

_Last updated: 2026-03-21 after v1.0 milestone_
