# Volumix フリーミアムモデル実装計画

`business_plan.md`に基づき、**A案（一度に1ファイルまで制限）+ Lemon Squeezyライセンス認証**を実装します。

---

## ユーザー確認事項

> [!IMPORTANT]
> **Lemon Squeezy設定について**
> - Lemon Squeezyのアカウント登録と商品登録は完了していますか？
> - APIキーを取得していますか？（後で安全に設定します）

> [!WARNING]
> **Rate Limit機能について**
> ビジネスプランにある「30分間に10ファイルまで」のRate Limit機能も併せて実装しますか？

---

## 現在の状態

| 項目 | 状態 |
|:---|:---|
| 複数ファイル選択 | ✅ 実装済み（`FileDropper`、`FileTable`） |
| 一括処理 | ✅ 実装済み（`App.jsx`の`handleStart`） |
| ライセンス認証 | ❌ 未実装 |

---

## 提案する変更

### ライセンス管理モジュール

#### [NEW] [license.cjs](file:///d:/userdata/documents/dev/volumix/electron/license.cjs)

ライセンス管理のコアロジック：
- ライセンスキーの検証（Lemon Squeezy API）
- ライセンス状態のローカル保存（`electron-store`使用）
- Pro/Free判定ヘルパー

---

### Electronメインプロセス

#### [MODIFY] [main.cjs](file:///d:/userdata/documents/dev/volumix/electron/main.cjs)

- ライセンスモジュールの読み込み
- IPCハンドラ追加：
  - `get-license-status`: 現在のライセンス状態取得
  - `activate-license`: ライセンスキー認証
  - `deactivate-license`: ライセンス解除

#### [MODIFY] [preload.cjs](file:///d:/userdata/documents/dev/volumix/electron/preload.cjs)

- ライセンス関連APIをレンダラーに公開

---

### フロントエンド

#### [NEW] [LicenseModal.jsx](file:///d:/userdata/documents/dev/volumix/src/components/LicenseModal.jsx)

ライセンス入力・管理UI：
- ライセンスキー入力フォーム
- 認証状態の表示
- Pro版へのアップグレード案内

#### [MODIFY] [App.jsx](file:///d:/userdata/documents/dev/volumix/src/App.jsx)

- ライセンス状態の読み込み
- Free版制限の適用：
  - **一度に1ファイルまで**（追加ファイルは警告表示）
  - Pro版ならファイル数無制限
- ライセンスモーダルの組み込み

#### [MODIFY] [FileDropper.jsx](file:///d:/userdata/documents/dev/volumix/src/components/FileDropper.jsx)

- Free版で複数ファイル選択時の制限メッセージ

---

### 依存関係

#### [MODIFY] [package.json](file:///d:/userdata/documents/dev/volumix/package.json)

```diff
  "dependencies": {
+   "electron-store": "^8.1.0",
    "ffmpeg-static": "^5.3.0",
```

---

## 機能制限まとめ

| 機能 | Free版 | Pro版 |
|:---|:---|:---|
| **ファイル数** | 一度に1ファイルまで | 無制限 |
| **動画の長さ** | 無制限 | 無制限 |
| **サンプリングレート** | 44.1kHz / 48kHz | 96kHz も可 |
| **全機能** | ✅ | ✅ |

---

## 検証計画

### 手動テスト

1. **Free版制限のテスト**
   - アプリ起動（未認証状態）
   - 2つ以上のファイルをドロップ → 制限メッセージが表示されることを確認
   - 1ファイルのみの処理は正常に動作することを確認

2. **ライセンス認証のテスト**
   - 設定画面からライセンスモーダルを開く
   - 無効なキーで認証 → エラーメッセージ表示
   - 有効なキーで認証 → Pro版に切り替わり、複数ファイル処理が可能に

3. **サンプリングレート制限のテスト**
   - Free版で96kHzオプションがグレーアウトされていること

### ユーザー協力が必要なテスト

> [!NOTE]  
> Lemon Squeezy APIとの連携テストには、実際のAPIキーと商品設定が必要です。
> テスト用ライセンスキーを発行していただくか、ダミーモードで先に実装を進めるか決定をお願いします。

---

## 実装順序

1. `electron-store`の追加
2. `license.cjs`の作成
3. `main.cjs`へのIPC追加
4. `preload.cjs`の更新
5. `LicenseModal.jsx`の作成
6. `App.jsx`の制限ロジック追加
7. `FileDropper.jsx`の更新
8. `ControlPanel.jsx`のサンプリングレート制限
