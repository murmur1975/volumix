# Volumix 多言語対応タスク

## 環境構築

- [x] 翻訳ファイル作成（`src/locales/ja.json`, `src/locales/en.json`）
- [x] 言語Context作成（`src/contexts/LanguageContext.jsx`）

## コンポーネント更新

- [x] `App.jsx` - 言語Provider追加
- [x] `ControlPanel.jsx` - 翻訳適用
- [x] `FileDropper.jsx` - 翻訳適用（N/A - ハードコード文字列なし）
- [x] `FileTable.jsx` - 翻訳適用（N/A - ハードコード文字列なし）
- [x] `SettingsModal.jsx` - 言語切替UI追加
- [x] `LicenseModal.jsx` - 翻訳適用
- [x] `ProgressBar.jsx` - 翻訳適用（N/A - ステータスのみ）

## 永続化

- [x] 言語設定をelectron-storeに保存
- [x] 起動時に保存済み言語を読み込み

## 検証

- [/] 言語切替テスト
- [ ] 設定永続化テスト
