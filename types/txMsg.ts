import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import {
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission,
} from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import {
  MsgBeginRedelegate,
  MsgDelegate,
  MsgUndelegate,
} from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { MsgCreateVestingAccount } from "cosmjs-types/cosmos/vesting/v1beta1/tx";
import {
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgInstantiateContract2,
  MsgMigrateContract,
} from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import { MsgCreateValidator,MsgEditValidator } from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { MsgUnjail } from "cosmjs-types/cosmos/slashing/v1beta1/tx";

export const MsgTypeUrls = {
  Send: "/cosmos.bank.v1beta1.MsgSend",
  SetWithdrawAddress: "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress",
  WithdrawDelegatorReward: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
  BeginRedelegate: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
  Delegate: "/cosmos.staking.v1beta1.MsgDelegate",
  Undelegate: "/cosmos.staking.v1beta1.MsgUndelegate",
  Vote: "/cosmos.gov.v1beta1.MsgVote",
  CreateVestingAccount: "/cosmos.vesting.v1beta1.MsgCreateVestingAccount",
  Transfer: "/ibc.applications.transfer.v1.MsgTransfer",
  Execute: "/cosmwasm.wasm.v1.MsgExecuteContract",
  Instantiate: "/cosmwasm.wasm.v1.MsgInstantiateContract",
  Instantiate2: "/cosmwasm.wasm.v1.MsgInstantiateContract2",
  Migrate: "/cosmwasm.wasm.v1.MsgMigrateContract",
  CreateValidator: "/cosmos.staking.v1beta1.MsgCreateValidator",
  EditValidator: "/cosmos.staking.v1beta1.MsgEditValidator",
  Unjail: "/cosmos.slashing.v1beta1.MsgUnjail",
  WithdrawValidatorCommission: "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission",
} as const;

export type MsgTypeUrl = (typeof MsgTypeUrls)[keyof typeof MsgTypeUrls];

export const MsgCodecs = {
  [MsgTypeUrls.Send]: MsgSend,
  [MsgTypeUrls.SetWithdrawAddress]: MsgSetWithdrawAddress,
  [MsgTypeUrls.WithdrawDelegatorReward]: MsgWithdrawDelegatorReward,
  [MsgTypeUrls.WithdrawValidatorCommission]: MsgWithdrawValidatorCommission,
  [MsgTypeUrls.BeginRedelegate]: MsgBeginRedelegate,
  [MsgTypeUrls.Delegate]: MsgDelegate,
  [MsgTypeUrls.Undelegate]: MsgUndelegate,
  [MsgTypeUrls.Vote]: MsgVote,
  [MsgTypeUrls.CreateVestingAccount]: MsgCreateVestingAccount,
  [MsgTypeUrls.Transfer]: MsgTransfer,
  [MsgTypeUrls.Execute]: MsgExecuteContract,
  [MsgTypeUrls.Instantiate]: MsgInstantiateContract,
  [MsgTypeUrls.Instantiate2]: MsgInstantiateContract2,
  [MsgTypeUrls.Migrate]: MsgMigrateContract,
  [MsgTypeUrls.CreateValidator]: MsgCreateValidator,
  [MsgTypeUrls.EditValidator]: MsgEditValidator,
  [MsgTypeUrls.Unjail]: MsgUnjail,
};
