# Volumix

MP4動画のラウドネス（LKFS/LUFS）を指定した値に正規化するデスクトップアプリケーションです。

## 特徴

- 🎚️ **ラウドネス正規化**: 指定した LKFS 値に音量を自動調整
- 📊 **EBU R128 準拠**: 業界標準の測定方式を採用
- 🔄 **反復処理**: 最大5回の反復で高精度な調整を実現
- 📁 **複数ファイル対応**: Pro版では複数ファイルの一括処理が可能
- 🎛️ **サンプリングレート変更**: 44.1kHz / 48kHz / 96kHz から選択可能
- 🖥️ **クロスプラットフォーム**: Windows / macOS 対応

## 技術スタック

- **フロントエンド**: React 19 + Vite 7
- **バックエンド**: Electron 39
- **音声処理**: FFmpeg (ffmpeg-static)
- **永続化**: electron-store
- **ライセンス認証**: Lemon Squeezy API

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build
```

## プロジェクト構成

```
volumix/
├── electron/           # Electron メインプロセス
│   ├── main.cjs        # メインプロセス（IPC、FFmpeg処理）
│   └── preload.cjs     # プリロードスクリプト
├── src/
│   ├── components/     # React コンポーネント
│   │   ├── ControlPanel.jsx    # LKFS/サンプルレート設定
│   │   ├── FileDropper.jsx     # ファイルD&D
│   │   ├── FileTable.jsx       # ファイル一覧
│   │   ├── LicenseModal.jsx    # ライセンス管理
│   │   ├── ProgressBar.jsx     # 進捗表示
│   │   └── SettingsModal.jsx   # 出力ファイル名設定
│   ├── App.jsx         # メインアプリケーション
│   └── index.css       # グローバルスタイル
├── docs/               # ドキュメント
│   ├── architecture.md         # アーキテクチャ
│   ├── business_plan.md        # ビジネスモデル
│   ├── faq.md                  # よくある質問
│   ├── implementation_plan.md  # 実装計画
│   └── licensing_mechanism.md  # ライセンス認証の仕組み
└── package.json
```

## ビジネスモデル（フリーミアム）

| 機能 | Free版 | Pro版 |
|:---|:---|:---|
| 同時処理数 | 1ファイル | 無制限 |
| レートリミット | 30分に10ファイル | なし |
| 高音質出力 (96kHz) | ✗ | ✓ |

## ライセンス

Private

## 開発

```bash
# 開発モード（ホットリロード対応）
npm run dev

# ESLint
npm run lint
```

---

© 2024-2026 Volumix
