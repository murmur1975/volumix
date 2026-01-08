# 複数ファイル対応機能の実装

## Planning
- [x] 現在のコードベース分析
- [x] 実装計画書の作成

## Execution
- [x] `FileDropper.jsx` - 複数ファイルD&D対応
- [x] 新規: `FileTable.jsx` - ファイル一覧テーブルコンポーネント
- [x] `App.jsx` - 状態管理を配列に変更
- [x] `electron/main.cjs` - 複数ファイル選択サポート（`select-files` ハンドラ追加）
- [x] `electron/preload.cjs` - `selectFiles` API追加
- [x] `index.css` - テーブルスタイル追加（FileTable.jsx内にインライン実装）

## Verification
- [x] アプリの起動確認
- [x] UIの表示確認（「Multiple files supported」が表示されている）
- [ ] 複数ファイルのD&D動作確認（手動テスト）
- [ ] LKFS一括解析の動作確認（手動テスト）
- [ ] チェックボックス/一括変換の動作確認（手動テスト）
