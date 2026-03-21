# Requirements: Murder Mystery Memo

**Defined:** 2026-03-21
**Core Value:** キャンバス上でメモを直感的に追加・配置・編集でき、ゲームプレイを中断せずに情報を整理できること

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Canvas

- [ ] **CANVAS-01**: @xyflow/react によるビューポート全画面キャンバスが表示される
- [ ] **CANVAS-02**: キャンバスをドラッグでパンできる
- [ ] **CANVAS-03**: スクロールでズームイン・アウトできる

### Memo

- [ ] **MEMO-01**: キャンバス上をダブルクリックしてメモを追加できる
- [ ] **MEMO-02**: メモ生成と同時に編集状態になりテキスト入力にフォーカスが当たる
- [ ] **MEMO-03**: Enter で改行できる
- [ ] **MEMO-04**: Shift+Enter で編集を確定できる
- [ ] **MEMO-05**: Escape で編集をキャンセルできる（新規メモは破棄）
- [ ] **MEMO-06**: 既存メモをダブルクリックして再編集できる
- [ ] **MEMO-07**: メモ外をクリックして編集を確定できる
- [ ] **MEMO-08**: メモをドラッグで自由移動できる

### Persistence

- [ ] **PERS-01**: メモデータ（内容・位置）をlocalStorageに保存できる
- [ ] **PERS-02**: ページリロード時にlocalStorageからメモを復元できる

### Reset

- [ ] **RESET-01**: リセットボタンで全メモを一括削除できる
- [ ] **RESET-02**: リセット実行前に確認ダイアログが表示される

### Visual

- [ ] **VIS-01**: ダークノワール調カラーパレットが適用されている
- [ ] **VIS-02**: 指定フォント（Playfair Display, Noto Serif JP, Noto Sans JP）が適用されている
- [ ] **VIS-03**: リセットボタンが右上に固定表示されている

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Interaction

- **INTR-01**: Undo/Redo で操作を取り消し・やり直しできる
- **INTR-02**: メモを個別に削除できる
- **INTR-03**: メモをリサイズできる

### Collaboration

- **COLLAB-01**: 保存状態インジケーターが表示される
- **COLLAB-02**: エクスポート機能（JSON/画像）

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature                  | Reason                                 |
| ------------------------ | -------------------------------------- |
| バックエンドAPI          | フロントエンドのみ、localStorage永続化 |
| ユーザー認証             | 個人利用、ログイン不要                 |
| リアルタイム同期         | 単一デバイスでの使用                   |
| モバイル対応             | PCブラウザ専用                         |
| メモ間の接続線（エッジ） | メモアプリでありグラフツールではない   |
| ツールバー・サイドバー   | UIは最小限（リセットボタンのみ）       |
| マークダウンレンダリング | プレーンテキストで十分                 |
| タグ・カテゴリ分け       | シンプルな自由配置がコアバリュー       |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status  |
| ----------- | ----- | ------- |
| CANVAS-01   | —     | Pending |
| CANVAS-02   | —     | Pending |
| CANVAS-03   | —     | Pending |
| MEMO-01     | —     | Pending |
| MEMO-02     | —     | Pending |
| MEMO-03     | —     | Pending |
| MEMO-04     | —     | Pending |
| MEMO-05     | —     | Pending |
| MEMO-06     | —     | Pending |
| MEMO-07     | —     | Pending |
| MEMO-08     | —     | Pending |
| PERS-01     | —     | Pending |
| PERS-02     | —     | Pending |
| RESET-01    | —     | Pending |
| RESET-02    | —     | Pending |
| VIS-01      | —     | Pending |
| VIS-02      | —     | Pending |
| VIS-03      | —     | Pending |

**Coverage:**

- v1 requirements: 18 total
- Mapped to phases: 0
- Unmapped: 18 ⚠️

---

_Requirements defined: 2026-03-21_
_Last updated: 2026-03-21 after initial definition_
