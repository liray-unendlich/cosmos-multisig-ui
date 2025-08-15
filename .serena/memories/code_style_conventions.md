# コードスタイルと規約

## TypeScript設定
- **ターゲット**: ES2021
- **Strict Mode**: false (厳密モード無効)
- **モジュール解決**: bundler
- **パスエイリアス**: `@/*` で プロジェクトルートを参照
- **JSX**: preserve

## ESLint規約
- **extends**: 
  - next/core-web-vitals
  - @typescript-eslint/recommended
  - prettier (Prettierとの統合)
- **主要ルール**:
  - `curly`: multi-line, consistent
  - `no-console`: off (console使用可)
  - `prefer-const`: warn
  - `@typescript-eslint/no-unused-vars`: warn (アンダースコア始まりの変数は無視)
  - React prop-typesは不要 (TypeScriptで型定義)

## Prettier設定
- **行幅**: 100文字
- **末尾カンマ**: all (すべての要素に末尾カンマ)
- **Tailwind CSS統合**: prettier-plugin-tailwindcss使用
- **Tailwind関数**: clsx, cn, cva, tw, twMerge

## 命名規則
- **コンポーネント**: PascalCase (例: `TransactionSigning.tsx`)
- **ユーティリティ関数**: camelCase (例: `displayHelpers.ts`)
- **定数**: UPPER_SNAKE_CASE
- **ファイル名**: 
  - コンポーネント: PascalCase.tsx
  - その他: camelCase.ts

## ディレクトリ構成
- コンポーネントは機能別にグループ化
- libディレクトリにヘルパー関数を配置
- 型定義はtypesディレクトリに集約

## インポート
- 絶対パスインポート推奨 (`@/` プレフィックス使用)
- simple-import-sortプラグインで自動整理