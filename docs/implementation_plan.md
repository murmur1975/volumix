# 機能制限およびライセンス認証の実装計画

フリーミアムモデル（A案）と Lemon Squeezy 連携の実装計画です。

## 変更内容

### [バックエンド] Electron メインプロセス
#### [変更] [main.cjs](file:///c:/Users/sts3886/Documents/dev/volumix/electron/main.cjs)
- `electron-store` を導入し、ライセンスキーと利用履歴を永続化。
- 以下の IPC ハンドラーを実装：
    - `check-license`: Lemon Squeezy API でキーを検証し、アクティベーション状態を確認。
    - `activate-license`: 新しいキーを Lemon Squeezy でアクティベート。
    - `get-pro-status`: 現在 Pro 版かどうかを返す。
    - `get-usage-info`: 直近30分間の利用統計を返す。
    - `record-file-processed`: 処理完了時にタイムスタンプを記録。

### [フロントエンド] React アプリケーション
#### [変更] [App.jsx](file:///c:/Users/sts3886/Documents/dev/volumix/src/App.jsx)
- マウント時に Pro 状態を取得。
* `handleFilesSelected` の更新：Free 版の場合、一度に 1 ファイルのみ追加可能に制限。
* `handleStart` の更新：Free 版の場合、レート制限（30分間に10ファイル）をチェック。
- UI に "Pro" / "Free" のバッジを表示。

#### [新規] [LicenseModal.jsx](file:///c:/Users/sts3886/Documents/dev/volumix/src/components/LicenseModal.jsx)
- Lemon Squeezy のライセンスキー入力用モーダル。
- 現在のアクティベーション状態を表示。

#### [変更] [ControlPanel.jsx](file:///c:/Users/sts3886/Documents/dev/volumix/src/components/ControlPanel.jsx)
- Free 版の場合、「Pro 版へアップグレード」ボタンを表示。

## 検証計画
### 手動検証
1. **Free 版の制限テスト（ファイル数）**:
    - 3つのファイルをドラッグ＆ドロップし、最初の1つだけが追加される（または警告が出る）ことを確認。
2. **Free 版の制限テスト（レート制限）**:
    - 単発の処理を 10 回素早く行い、11 回目で「制限に達しました」というメッセージが出ることを確認。
3. **Pro 版アクティベーションテスト**:
    - ライセンスモーダルを開き、キーを入力してアクティベート。
    - "Pro" バッジが表示されることを確認。
    - 複数ファイルの同時追加・処理が無制限に行えることを確認。
