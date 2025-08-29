import { MsgSend } from "cosmjs-types/cosmos/bank/v1beta1/tx";
import {
  MsgFundCommunityPool,
  MsgSetWithdrawAddress,
  MsgWithdrawDelegatorReward,
  MsgWithdrawValidatorCommission,
} from "cosmjs-types/cosmos/distribution/v1beta1/tx";
import { MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { MsgUnjail } from "cosmjs-types/cosmos/slashing/v1beta1/tx";
import {
  MsgBeginRedelegate,
  MsgCreateValidator,
  MsgDelegate,
  MsgEditValidator,
  MsgUndelegate,
} from "cosmjs-types/cosmos/staking/v1beta1/tx";
import { MsgCreateVestingAccount } from "cosmjs-types/cosmos/vesting/v1beta1/tx";
import {
  MsgExecuteContract,
  MsgInstantiateContract,
  MsgInstantiateContract2,
  MsgMigrateContract,
  MsgUpdateAdmin,
} from "cosmjs-types/cosmwasm/wasm/v1/tx";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";

export const MsgTypeUrls = {
  // Bank
  Send: "/cosmos.bank.v1beta1.MsgSend",
  // Staking
  Delegate: "/cosmos.staking.v1beta1.MsgDelegate",
  Undelegate: "/cosmos.staking.v1beta1.MsgUndelegate",
  BeginRedelegate: "/cosmos.staking.v1beta1.MsgBeginRedelegate",
  CreateValidator: "/cosmos.staking.v1beta1.MsgCreateValidator",
  EditValidator: "/cosmos.staking.v1beta1.MsgEditValidator",
  Unjail: "/cosmos.slashing.v1beta1.MsgUnjail",
  // Distribution
  FundCommunityPool: "/cosmos.distribution.v1beta1.MsgFundCommunityPool",
  SetWithdrawAddress: "/cosmos.distribution.v1beta1.MsgSetWithdrawAddress",
  WithdrawDelegatorReward: "/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward",
  WithdrawValidatorCommission: "/cosmos.distribution.v1beta1.MsgWithdrawValidatorCommission",
  // Vesting
  CreateVestingAccount: "/cosmos.vesting.v1beta1.MsgCreateVestingAccount",
  // Governance
  Vote: "/cosmos.gov.v1beta1.MsgVote",
  // IBC
  Transfer: "/ibc.applications.transfer.v1.MsgTransfer",
  // CosmWasm
  InstantiateContract: "/cosmwasm.wasm.v1.MsgInstantiateContract",
  InstantiateContract2: "/cosmwasm.wasm.v1.MsgInstantiateContract2",
  UpdateAdmin: "/cosmwasm.wasm.v1.MsgUpdateAdmin",
  ExecuteContract: "/cosmwasm.wasm.v1.MsgExecuteContract",
  MigrateContract: "/cosmwasm.wasm.v1.MsgMigrateContract",
} as const;

export type MsgTypeUrl = (typeof MsgTypeUrls)[keyof typeof MsgTypeUrls];

export const MsgCodecs = {
  // Bank
  [MsgTypeUrls.Send]: MsgSend,
  // Staking
  [MsgTypeUrls.Delegate]: MsgDelegate,
  [MsgTypeUrls.Undelegate]: MsgUndelegate,
  [MsgTypeUrls.BeginRedelegate]: MsgBeginRedelegate,
  [MsgTypeUrls.CreateValidator]: MsgCreateValidator,
  [MsgTypeUrls.EditValidator]: MsgEditValidator,
  [MsgTypeUrls.Unjail]: MsgUnjail,
  // Distribution
  [MsgTypeUrls.FundCommunityPool]: MsgFundCommunityPool,
  [MsgTypeUrls.SetWithdrawAddress]: MsgSetWithdrawAddress,
  [MsgTypeUrls.WithdrawDelegatorReward]: MsgWithdrawDelegatorReward,
  [MsgTypeUrls.WithdrawValidatorCommission]: MsgWithdrawValidatorCommission,
  // Vesting
  [MsgTypeUrls.CreateVestingAccount]: MsgCreateVestingAccount,
  // Governance
  [MsgTypeUrls.Vote]: MsgVote,
  // IBC
  [MsgTypeUrls.Transfer]: MsgTransfer,
  // CosmWasm
  [MsgTypeUrls.InstantiateContract]: MsgInstantiateContract,
  [MsgTypeUrls.InstantiateContract2]: MsgInstantiateContract2,
  [MsgTypeUrls.UpdateAdmin]: MsgUpdateAdmin,
  [MsgTypeUrls.ExecuteContract]: MsgExecuteContract,
  [MsgTypeUrls.MigrateContract]: MsgMigrateContract,
};
