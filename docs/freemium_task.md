# Volumix フリーミアム実装タスク

## 計画

- [x] 実装計画の作成とレビュー

## 環境構築

- [x] `electron-store`の依存関係追加

## バックエンド実装

- [x] `electron/license.cjs`の作成
  - [x] ライセンス状態管理
  - [x] Lemon Squeezy API連携
  - [x] ローカルストレージ永続化
- [x] `electron/main.cjs`のIPC追加
  - [x] `get-license-status`ハンドラ
  - [x] `activate-license`ハンドラ
  - [x] `deactivate-license`ハンドラ
- [x] `electron/preload.cjs`の更新

## フロントエンド実装

- [x] `LicenseModal.jsx`の作成
- [x] `App.jsx`の制限ロジック追加
- [x] `SettingsModal.jsx`にライセンスセクション追加
- [x] `ControlPanel.jsx`のサンプリングレート制限

## 検証

- [/] Free版制限テスト
- [ ] ライセンス認証テスト
- [ ] Pro版機能テスト
