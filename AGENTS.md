# Repository Guidelines

本書は cosmos-multisig-ui への貢献者が共通理解を素早く得るための手引きです。Next.js 14、TypeScript、CosmJS、Neo4j AuraDB を柱とするアプリである点を念頭に作業してください。

## プロジェクト構成とモジュール組織
- `pages/` は Next.js ルーティング層で、API も `pages/api/` に配置します。Neo4j へのクエリは `lib/neo4j.ts` と `graphql/` 配下の Cypher ヘルパーに集約してください。
- 再利用 UI やフォームロジックは `components/` に置き、atom→molecule→organism を意識して細分化します。
- `lib/` は CosmJS 連携やトランザクション組成などのドメインロジック置き場、`context/` はアプリ全体の状態を提供する React Context を定義します。
- Neo4j/Cypher 層は `graphql/` に集約し、型補助は `types/`、スタイルは `styles/` と `tailwind.config.js`、静的アセットは `public/` にまとまっています。仕様メモは `docs/` 配下に整理してください。

## ビルド・テスト・開発コマンド
- `npm run dev`：`NEXT_PUBLIC_*` と `NEO4J_*` を読み込みつつローカル開発サーバーを起動します。AuraDB に接続できないと API ルートが失敗するので注意してください。
- `npm run build`：本番ビルド。Cypher ヘルパーや型の崩れもここで検出されるため PR 前に必ず実行します。
- `npm start`：`next start` でビルド済み成果物を検証します。
- `npm run lint` / `npm run lint:fix`：ESLint 9 (typescript-eslint + next) を利用し、`npm run lint:fix` で自動修正も可能です。
- `npm run format`：Prettier + `prettier-plugin-tailwindcss` で並び順とインデントを揃えます。
- `npm run test`：Jest + Testing Library を watch モードで動作させ、`npm run test:ci` は CI 用の非対話実行です。

## コーディングスタイルと命名規則
TypeScript は `tsconfig.json` の strict 設定を前提にし、非 null アサーションを避けて `zod` や `react-hook-form` で型安全性を確保します。インデントは 2 スペース、ファイルは基本的に PascalCase のコンポーネント (`AccountList.tsx`) と kebab-case のスタイル (`account-list.css`) に統一してください。カスタムフックは `use` 接頭辞を付けて `lib/` へ、Neo4j/Cypher のロジックは `graphql/*.ts` にまとめて `zod` 型で検証しながら書きます。

## テスト指針
`jest.config.mjs` は jsdom 環境を前提としているため、UI ロジックは Testing Library で振る舞いを検証してください。ファイル名は `*.test.tsx` とし、コンポーネント直下か `__tests__` ディレクトリに配置します。ウォレット接続や Neo4j への書き込みは `lib/neo4j.ts` をモックして I/O を分離し、`cosmjs` 系はインターフェースを抽象化してユニットテストしやすいようにします。クリティカルパス（マルチシグ作成、トランザクション署名、ブロードキャスト）は最低限ハッピーパスとエラーケースの 2 本立てでカバーしてください。

## コミットと Pull Request ガイドライン
Git ログは「Fix …」「Add …」といった命令形サマリが主流です。同じスタイルで 72 文字以内の件名を保ち、本文に Cypher/Neo4j の変更や UI 差分、関連 Issue を箇条書きで残してください。PR では機能概要、テスト結果 (`npm run build && npm run test`)、UI 変更時のスクリーンショット、必要であれば新しい環境変数を `docs/` か `.env.sample` に追記した旨を説明します。Neo4j のスキーマを変更する場合は `docs/` に追記し、検証手順とロールバック手順を同じ PR 説明欄に添付してください。

## セキュリティと設定のヒント
`.env.sample` を `.env.local` にコピーし、`NEO4J_URI`/`NEO4J_USERNAME`/`NEO4J_PASSWORD` や `NEXT_PUBLIC_NODE_ADDRESS` を埋めます。機密値は絶対にコミットせず、Vercel では `Settings → Environment Variables` で管理してください。Neo4j AuraDB とは `neo4j+s://` (TLS) で通信するため、認証情報のローテーションと監視を忘れず、署名鍵やマルチシグ構成ファイルは `docs/` 内ではなく安全なシークレットマネージャーに保存します。
