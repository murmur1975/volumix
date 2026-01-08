# Volumix 技術アーキテクチャ

このドキュメントでは、Volumixアプリがどのように動作しているか、特に「開発中」と「配布用（本番）」でのサーバーの扱いの違いについて解説します。

## アーキテクチャ図

### 1. 開発モード (Development)
現在動かしている状態です。変更を即座に反映させるために、ローカルサーバーが裏で動いています。

```mermaid
graph TD
    subgraph Development ["現在（開発モード）"]
        direction TB
        DevServer["Vite 開発サーバー\n(localhost:5173)\nホットリロード機能付き"] 
        ElectronDev["Electron アプリ\n(ブラウザウィンドウ)"]
        
        DevServer --"UI画面を配信 (HTTP)"--> ElectronDev
        style DevServer fill:#e1f5fe,stroke:#01579b
        style ElectronDev fill:#fff3e0,stroke:#ff6f00
    end
```

### 2. 配布用アプリ (Production)
ユーザーに配布する際（ビルド後）の状態です。**サーバーは消滅**し、アプリ単体で完結します。

```mermaid
graph TD
    subgraph Production ["配布時（本番アプリ）"]
        direction TB
        StaticFiles["ビルド済み静的ファイル\n(HTML/CSS/JS)\nアプリ内に梱包"]
        ElectronProd["Electron アプリ\n(実行ファイル .exe)"]
        
        StaticFiles --"内部アクセス (file://)"--> ElectronProd
        
        Note["サーバー不要\nネット不要\n完全オフライン動作"] -.-> StaticFiles
        
        style StaticFiles fill:#e8f5e9,stroke:#2e7d32
        style ElectronProd fill:#fff3e0,stroke:#ff6f00
    end
```

## 解説

- **開発サーバー (Vite)**: 開発中のみ使用します。コードを保存するたびに自動で画面を更新してくれる便利なツールですが、完成したアプリには含めません。
- **ビルド (Build)**: 開発サーバーで動いていた内容を、サーバーなしで動く「ただのファイル（HTML/CSS/JS）」に変換する作業です。
- **配布**: 完成した `.exe` ファイルの中には、この変換されたファイルがすべて埋め込まれています。そのため、ユーザーのPCでサーバーを立てる必要はありません。
