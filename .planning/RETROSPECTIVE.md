# Project Retrospective

_A living document updated after each milestone. Lessons feed forward into future planning._

## Milestone: v1.0 — MVP

**Shipped:** 2026-03-21
**Phases:** 4 | **Plans:** 7 | **Sessions:** 1 day

### What Was Built

- @xyflow/react キャンバス上でのメモ追加・編集・ドラッグ移動
- valibot検証付きlocalStorage永続化（保存・復元）
- リセットボタン + AlertDialog確認ダイアログ
- ノワールカラーパレット11色 + セリフフォントの探偵ノート風UI

### What Worked

- 4フェーズを1日で完走 — フェーズ分割粒度が適切だった
- Convex/Clerk/Cloudflare の完全削除を最初に行い、クリーンな基盤から開始できた
- MODULE_SCOPE nodeTypes定義でReactFlowの再マウント問題を事前回避
- valibot safeParse をlocalStorage信頼境界として使用 — 破損データに対する堅牢性

### What Was Inefficient

- ROADMAP.md の Phase 3 ステータスが未更新のまま残った（手動更新漏れ）
- SUMMARY.md frontmatter の requirements_completed フィールドが一部未記入
- e2e/global.setup.ts が削除済みの @clerk/testing をインポートしたまま（クリーンアップ漏れ）

### Patterns Established

- Feature-Sliced Design でのキャンバス機能スライス構成（features/canvas/, features/reset/）
- forwardRef + useImperativeHandle でReactFlowProvider境界を超えたコンポーネント間通信
- Tailwind @theme inline で noir-\* カスタムカラートークン定義

### Key Lessons

1. nodeTypes はモジュールスコープ定数にする（inline定義 → 毎レンダーでノード再マウント）
2. @xyflow/react/dist/base.css のインポート順序がTailwind preflightと競合する — 最初にインポートすること
3. deleteKeyCode={null} でReactFlowのキーボードショートカットを無効化しないとtextarea操作と競合する

### Cost Observations

- Model mix: 主にopus使用
- Sessions: 1 day sprint
- Notable: 全4フェーズを1セッションで完了 — 小規模プロジェクトに適したペース

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change           |
| --------- | -------- | ------ | -------------------- |
| v1.0      | 1        | 4      | Initial GSD workflow |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
| --------- | ----- | -------- | ------------------ |
| v1.0      | —     | —        | 4 (valibot等)      |

### Top Lessons (Verified Across Milestones)

1. フェーズ分割は「検証可能な単位」で行うと1日で完走できる
2. 既存依存の完全削除をPhase 1で行うとクリーンな基盤で開発できる
