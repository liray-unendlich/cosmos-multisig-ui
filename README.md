# Cosmoshub Multisig App

このアプリは、Stargate 対応チェーン上でマルチシグを作成・署名・ブロードキャストするための Next.js 製 UI です。CosmJS、Neo4j AuraDB、Vercel を基盤に構築されています。

[本番環境はこちら](https://multisig.confio.run)。

[ユーザーガイド](https://github.com/samepant/cosmoshub-legacy-multisig/blob/master/docs/App%20User%20Guide.md)

## サポートしているトランザクション種別

`lib/msg.ts` が読み込む Cosmos SDK/CosmWasm のメッセージを UI から利用できます（Vesting 系と `MsgDeposit` は混乱回避のため非表示）。

- **Bank**: `MsgSend`, `MsgMultiSend`
- **Staking**: `MsgDelegate`, `MsgUndelegate`, `MsgBeginRedelegate`, `MsgCreateValidator`, `MsgEditValidator`
- **Distribution**: `MsgWithdrawDelegatorReward`, `MsgWithdrawValidatorCommission`, `MsgSetWithdrawAddress`, `MsgFundCommunityPool`
- **Governance**: `MsgSubmitProposal`, `MsgVote`, `MsgVoteWeighted`
- **Authz**: `MsgGrant`, `MsgExec`, `MsgRevoke`
- **Feegrant**: `MsgGrantAllowance`, `MsgRevokeAllowance`
- **IBC Transfer**: `MsgTransfer`
- **CosmWasm**: `MsgStoreCode`, `MsgInstantiateContract`, `MsgInstantiateContract2`, `MsgExecuteContract`, `MsgMigrateContract`, `MsgUpdateAdmin`, `MsgClearAdmin`

## 自分の環境で動かす

### 1. クローンと Vercel デプロイ設定

Vercel 上で Next.js のサーバーレス機能を使う構成です。Vercel アカウントを用意し、下記ボタンからクローン & デプロイしてください。環境変数を入れるまではデプロイが失敗します。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fhello-world)

### 2. 環境変数を設定

Vercel の `Settings -> Environment Variables` で `.env.sample` を参考に `NEO4J_URI` `NEO4J_USERNAME` `NEO4J_PASSWORD`（任意で `NEO4J_DATABASE`）を登録します。AuraDB の `neo4j+s://` URI をそのまま `NEO4J_URI` に使い、資格情報は安全に保管してください。

### 3. Neo4j AuraDB を用意

[Neo4j AuraDB Free](https://neo4j.com/cloud/platform/aura-graph-database/) で新しい DB を作成し、自動生成された接続情報を控えます。追加の移行作業は不要で、この時点でマルチシグやトランザクションの保存が可能です。

### 4. 再デプロイ

環境変数を入れたら再度デプロイすると、設定が反映された状態で動作します。

## ローカル開発

### 1. `.env.local` を作成

`.env.sample` をコピーして `.env.local` を作り、必要なキーを埋めます。

### 2. Cosmos SDK Simapp を起動

`uatom` など Cosmoshub4 と同じ denom に揃えた simapp をローカルで起動し、`NEXT_PUBLIC_NODE_ADDRESS` にノードのエンドポイントを書きます。

### 3. Neo4j に接続

AuraDB もしくはローカルの Neo4j の接続情報を `.env.local` に入れます（`NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, 必要なら `NEO4J_DATABASE`）。

### 4. サーバーを起動

Simapp を動かした状態で別ターミナルから以下を実行します。

```
// node v12.5.0 以上を推奨
npm install
npm run dev
```
