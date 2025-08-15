# 推奨コマンド一覧

## 開発環境
```bash
# 開発サーバー起動
yarn dev

# ビルド
yarn build

# プロダクションサーバー起動
yarn start
```

## コード品質管理
```bash
# ESLintでコード検査
yarn lint

# ESLintで自動修正
yarn lint:fix

# Prettierでコードフォーマット
yarn format
```

## テスト
```bash
# テスト実行（ウォッチモード）
yarn test

# CI用テスト実行（単発）
yarn test:ci
```

## 依存関係管理
```bash
# パッケージインストール
yarn install

# パッケージ追加
yarn add [package-name]

# 開発用パッケージ追加
yarn add -D [package-name]
```

## Git操作
```bash
# ステータス確認
git status

# 変更を追加
git add .

# コミット
git commit -m "メッセージ"

# プッシュ
git push origin [branch-name]
```

## システムコマンド (Linux)
```bash
# ディレクトリ一覧
ls -la

# ファイル検索
find . -name "*.ts"

# ファイル内容検索
grep -r "検索文字列" .

# プロセス確認
ps aux | grep node
```

## 環境設定
```bash
# 環境変数設定ファイルをコピー
cp .env.sample .env.local
```