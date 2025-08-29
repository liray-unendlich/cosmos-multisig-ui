# MsgForm統合戦略

## 保持すべきカスタムMsgForm
以下のMsgFormは独自に追加したものなので保持:
- MsgClaimValidatorCommissionForm (WithdrawValidatorCommission)
- MsgEditValidatorForm 
- MsgUnjailForm
- MsgCreateValidatorForm

## フォーク元の変更点
- MsgClaimRewardsForm → MsgWithdrawDelegatorRewardForm に名称変更
- MsgRedelegateForm → MsgBeginRedelegateForm に名称変更
- 新規追加: MsgFundCommunityPoolForm
- 新規追加: MsgUpdateAdminForm
- カテゴリ別にコメントで整理（Bank, Staking, Distribution等）

## 統合方針
1. フォーク元のディレクトリ構造とファイル名を採用
2. カスタムMsgFormは適切な場所に統合
3. TransactionInfo/index.tsxでは両方のMsgTypeを含める
4. OldCreateTxFormディレクトリに古いファイルを保管