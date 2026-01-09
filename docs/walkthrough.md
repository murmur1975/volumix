# Volumix ライセンス認証・機能制限 実装ウォークスルー

## 概要
フリーミアムモデル（A案）に基づき、Free版とPro版の機能差を実装しました。

## 変更したファイル

### バックエンド
- **[main.cjs](file:///c:/Users/sts3886/Documents/dev/volumix/electron/main.cjs)**
  - `electron-store` による永続化ストアを導入
  - ライセンス認証用IPCハンドラー（`activate-license`, `deactivate-license`, `get-pro-status`）
  - レート制限用IPCハンドラー（`get-usage-info`, `record-file-processed`）
  - 開発用テストキー `VOLUMIX-DEV-TEST-KEY` を追加

- **[preload.cjs](file:///c:/Users/sts3886/Documents/dev/volumix/electron/preload.cjs)**
  - ライセンス関連のAPI expose

### フロントエンド
- **[App.jsx](file:///c:/Users/sts3886/Documents/dev/volumix/src/App.jsx)**
  - Pro/Free状態管理
  - Free版制限：一度に1ファイルのみ処理可能
  - Free版制限：30分間に10ファイルまでのレートリミット
  - Pro/Freeバッジ（左上）をクリックでライセンスモーダルを開く
  - 残り処理可能ファイル数の表示

- **[LicenseModal.jsx](file:///c:/Users/sts3886/Documents/dev/volumix/src/components/LicenseModal.jsx)** [NEW]
  - ライセンスキー入力
  - アクティベーション・ディアクティベーション

## Free版の制限
| 項目 | 制限内容 |
|:---|:---|
| 同時処理数 | 一度に1ファイルのみ |
| レートリミット | 30分間に10ファイルまで |
| 複数ファイルD&D | 1ファイルのみ追加される |

## テスト方法

### Free版の動作確認
1. アプリ起動時、左上に「🆓 Free」バッジが表示される
2. 3ファイルを1つずつドラッグ＆ドロップでリストに追加
3. 3ファイルとも選択した状態で「Start Processing」を押す
4. → エラーメッセージ「Free版は一度に1ファイルずつしか処理できません」が表示される
5. チェックボックスで1ファイルだけ選択して処理 → 成功

### Pro版の動作確認
1. 「🆓 Free」バッジをクリック → ライセンスモーダルが開く
2. ライセンスキーに `VOLUMIX-DEV-TEST-KEY` を入力して「有効化」
3. → 「🌟 Pro」バッジに変わる
4. 複数ファイルを同時にドラッグ＆ドロップ → すべて追加される
5. 複数ファイルを選択して「Start Processing」 → すべて処理される

## 今後のステップ
1. Lemon Squeezyでの商品登録とライセンスキー発行設定
2. 本番用のAPI認証（APIキーのセキュアな管理）
3. ストアページの準備
