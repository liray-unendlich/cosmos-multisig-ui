# Cosmos Multisig UI - プロジェクト概要

## プロジェクトの目的
Cosmos Multisig UIは、Stargateに対応したCosmosチェーン上でマルチシグユーザーがトランザクションを作成、署名、ブロードキャストできるWebアプリケーションです。

## 技術スタック
- **フロントエンドフレームワーク**: Next.js 13.4.19 (React 18.2.0)
- **言語**: TypeScript 5.2.2
- **スタイリング**: 
  - Tailwind CSS 3.3.3
  - Radix UI (UIコンポーネントライブラリ)
  - shadcn/ui components
- **Cosmosエコシステム**: 
  - @cosmjs/stargate (Cosmos SDK通信)
  - cosmjs-types (Protoタイプ定義)
  - Keplrウォレット統合
- **データベース**: FaunaDB (GraphQL)
- **デプロイ/ホスティング**: Vercel
- **フォーム管理**: React Hook Form
- **テスト**: Jest + Testing Library

## プロジェクト構造
```
cosmos-multisig-ui/
├── components/      # Reactコンポーネント
│   ├── ui/         # 基本UIコンポーネント (shadcn/ui)
│   ├── forms/      # フォームコンポーネント
│   ├── dashboard/  # ダッシュボードコンポーネント
│   └── layout/     # レイアウトコンポーネント
├── pages/          # Next.jsページ (ルーティング)
│   ├── api/        # APIエンドポイント
│   └── [chainName]/# 動的ルート (チェーン別)
├── lib/            # ユーティリティ関数
│   └── packages/   # カスタムパッケージ
├── hooks/          # Reactカスタムフック
├── context/        # React Context API
├── types/          # TypeScript型定義
├── styles/         # グローバルスタイル
└── public/         # 静的ファイル
```

## 主要機能
- マルチシグアカウントの作成と管理
- トランザクションの作成、署名、ブロードキャスト
- 複数のCosmosチェーンのサポート
- Keplrウォレット統合
- Ledgerハードウェアウォレットサポート