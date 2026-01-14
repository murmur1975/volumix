# Volumix フリーミアム機能 統合タスク

## 購入URL設定
- [x] Lemon Squeezy購入URLを更新（tryxlab）

## お問い合わせ機能
- [x] SettingsModalにお問い合わせリンク追加
- [x] 多言語対応（日本語/英語）

## IPC統合
- [ ] `electron/main.cjs` - license.cjs連携
- [ ] `electron/preload.cjs` - API公開確認

## UI統合
- [ ] `src/main.jsx` - LanguageProvider確認
- [ ] `src/App.jsx` - 制限ロジック確認
- [ ] `src/components/SettingsModal.jsx` - 言語切替UI確認

## 検証
- [ ] アプリ起動確認
- [ ] ライセンス認証テスト
- [ ] 言語切替テスト
