# Volumix フリーミアム実装ウォークスルー

## 実装概要

`business_plan.md`に基づき、以下のフリーミアム機能を実装しました：

- **A案（ファイル数制限）**: Free版は一度に1ファイルまで
- **Rate Limit**: Free版は30分間に10ファイルまで
- **サンプリングレート制限**: Free版は48kHzまで（96kHzはPro版のみ）
- **Lemon Squeezy連携**: ライセンスキー認証システム

---

## 変更ファイル一覧

### 新規作成

| ファイル | 説明 |
|:---|:---|
| [license.cjs](file:///d:/userdata/documents/dev/volumix/electron/license.cjs) | ライセンス管理のコアモジュール |
| [LicenseModal.jsx](file:///d:/userdata/documents/dev/volumix/src/components/LicenseModal.jsx) | ライセンス入力UI |

### 変更

| ファイル | 変更内容 |
|:---|:---|
| [main.cjs](file:///d:/userdata/documents/dev/volumix/electron/main.cjs) | IPCハンドラ追加（ライセンス認証、Rate Limit） |
| [preload.cjs](file:///d:/userdata/documents/dev/volumix/electron/preload.cjs) | ライセンスAPIをレンダラーに公開 |
| [App.jsx](file:///d:/userdata/documents/dev/volumix/src/App.jsx) | Free版制限ロジック、ライセンスモーダル統合 |
| [SettingsModal.jsx](file:///d:/userdata/documents/dev/volumix/src/components/SettingsModal.jsx) | ライセンスセクション追加 |
| [ControlPanel.jsx](file:///d:/userdata/documents/dev/volumix/src/components/ControlPanel.jsx) | 96kHz制限（Pro版のみ） |
| [package.json](file:///d:/userdata/documents/dev/volumix/package.json) | `electron-store@8`追加 |

---

## 動作確認手順

### 1. Free版制限の確認

1. アプリを起動（`npm run dev`）
2. 2つ以上のファイルをドラッグ＆ドロップ
3. 「処理開始」ボタンが「Free版: 一度に1ファイルまで」と表示されることを確認
4. 1ファイルのみ選択して処理が正常に完了することを確認

### 2. Rate Limitの確認

1. 1ファイルずつ連続で10回処理
2. 11回目で「Rate Limit」メッセージが表示されることを確認

### 3. サンプリングレート制限

1. Control Panelの「Sampling Rate」ドロップダウンを確認
2. 「96 kHz (Pro版)」が無効（グレーアウト）になっていることを確認

### 4. ライセンス認証

1. メイン画面下部の「🚀 Pro版で複数ファイルの一括処理が可能に」バナーをクリック
2. または設定ボタン（⚙️）→ LICENSEセクションをクリック
3. ライセンスモーダルが表示される
4. Lemon Squeezyで発行されたライセンスキーを入力して認証

---

## 残作業

> [!NOTE]
> 以下はLemon Squeezy側の設定が必要です

1. **Productの公開**: Lemon SqueezyでProductをDraftから公開に変更
2. **購入ページURL**: `LicenseModal.jsx`内の購入リンクを実際のURL（`https://volumix.lemonsqueezy.com`など）に変更
3. **テスト購入**: テストモードでライセンスを発行して認証フローを確認

---

## 技術的な注意点

- **APIキーのセキュリティ**: 現在はコード内に埋め込まれていますが、本番リリース前に以下の対策を推奨：
  - 環境変数化（`LEMON_SQUEEZY_API_KEY`）
  - ビルド時に別ファイルから読み込み
  
- **オフライン対応**: ライセンス情報はローカルに暗号化保存されるため、オフラインでもPro機能が利用可能
