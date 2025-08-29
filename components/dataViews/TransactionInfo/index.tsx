import { DbTransactionParsedDataJson } from "@/graphql";
import { MsgTypeUrls } from "@/types/txMsg";
import { EncodeObject } from "@cosmjs/proto-signing";
import { useChains } from "../../../context/ChainsContext";
import { printableCoins } from "../../../lib/displayHelpers";
import StackableContainer from "../../layout/StackableContainer";
import TxMsgBeginRedelegateDetails from "./TxMsgBeginRedelegateDetails";
import TxMsgCreateVestingAccountDetails from "./TxMsgCreateVestingAccountDetails";
import TxMsgDelegateDetails from "./TxMsgDelegateDetails";
import TxMsgExecuteContractDetails from "./TxMsgExecuteContractDetails";
import TxMsgFundCommunityPoolDetails from "./TxMsgFundCommunityPoolDetails";
import TxMsgInstantiateContract2Details from "./TxMsgInstantiateContract2Details";
import TxMsgInstantiateContractDetails from "./TxMsgInstantiateContractDetails";
import TxMsgMigrateContractDetails from "./TxMsgMigrateContractDetails";
import TxMsgSendDetails from "./TxMsgSendDetails";
import TxMsgSetWithdrawAddressDetails from "./TxMsgSetWithdrawAddressDetails";
import TxMsgTransferDetails from "./TxMsgTransferDetails";
import TxMsgUndelegateDetails from "./TxMsgUndelegateDetails";
import TxMsgUpdateAdminDetails from "./TxMsgUpdateAdminDetails";
import TxMsgVoteDetails from "./TxMsgVoteDetails";
import TxMsgWithdrawDelegatorRewardDetails from "./TxMsgWithdrawDelegatorRewardDetails";
import TxMsgEditValidatorDetails from "./TxMsgEditValidatorDetails";
import TxMsgUnjailDetails from "./TxMsgUnjailDetails";
import TxMsgWithdrawValidatorCommissionDetails from "./TxMsgWithdrawValidatorCommissionDetails";

const TxMsgDetails = ({ typeUrl, value: msgValue }: EncodeObject) => {
  switch (typeUrl) {
    // Bank
    case MsgTypeUrls.Send:
      return <TxMsgSendDetails msgValue={msgValue} />;
    // Staking
    case MsgTypeUrls.Delegate:
      return <TxMsgDelegateDetails msgValue={msgValue} />;
    case MsgTypeUrls.Undelegate:
      return <TxMsgUndelegateDetails msgValue={msgValue} />;
    case MsgTypeUrls.BeginRedelegate:
      return <TxMsgBeginRedelegateDetails msgValue={msgValue} />;
    case MsgTypeUrls.EditValidator:
      return <TxMsgEditValidatorDetails msgValue={msgValue} />;
    case MsgTypeUrls.Unjail:
      return <TxMsgUnjailDetails msgValue={msgValue} />;
    // Distribution
    case MsgTypeUrls.FundCommunityPool:
      return <TxMsgFundCommunityPoolDetails msgValue={msgValue} />;
    case MsgTypeUrls.SetWithdrawAddress:
      return <TxMsgSetWithdrawAddressDetails msgValue={msgValue} />;
    case MsgTypeUrls.WithdrawDelegatorReward:
      return <TxMsgWithdrawDelegatorRewardDetails msgValue={msgValue} />;
    case MsgTypeUrls.WithdrawValidatorCommission:
      return <TxMsgWithdrawValidatorCommissionDetails msgValue={msgValue} />;
    // Vesting
    case MsgTypeUrls.CreateVestingAccount:
      return <TxMsgCreateVestingAccountDetails msgValue={msgValue} />;
    // Governance
    case MsgTypeUrls.Vote:
      return <TxMsgVoteDetails msgValue={msgValue} />;
    // IBC
    case MsgTypeUrls.Transfer:
      return <TxMsgTransferDetails msgValue={msgValue} />;
    // CosmWasm
    case MsgTypeUrls.InstantiateContract:
      return <TxMsgInstantiateContractDetails msgValue={msgValue} />;
    case MsgTypeUrls.InstantiateContract2:
      return <TxMsgInstantiateContract2Details msgValue={msgValue} />;
    case MsgTypeUrls.UpdateAdmin:
      return <TxMsgUpdateAdminDetails msgValue={msgValue} />;
    case MsgTypeUrls.ExecuteContract:
      return <TxMsgExecuteContractDetails msgValue={msgValue} />;
    case MsgTypeUrls.MigrateContract:
      return <TxMsgMigrateContractDetails msgValue={msgValue} />;
    default:
      return null;
  }
};

interface TransactionInfoProps {
  readonly tx: DbTransactionParsedDataJson;
}

const TransactionInfo = ({ tx }: TransactionInfoProps) => {
  const { chain } = useChains();

  return (
    <>
      <ul className="meta-data">
        <>
          <StackableContainer lessPadding lessMargin>
            {tx.fee ? (
              <>
                <li>
                  <label>Gas:</label>
                  <div>{tx.fee.gas}</div>
                </li>
                <li>
                  <label>Fee:</label>
                  <div>{printableCoins(tx.fee.amount, chain) || "None"}</div>
                </li>
              </>
            ) : null}
            {tx.memo ? (
              <li>
                <label>Memo:</label>
                <div>{tx.memo}</div>
              </li>
            ) : null}
          </StackableContainer>
          <StackableContainer lessPadding lessMargin>
            {tx.msgs.map((msg, index) => (
              <StackableContainer key={index} lessPadding lessMargin>
                <TxMsgDetails {...msg} />
              </StackableContainer>
            ))}
          </StackableContainer>
        </>
      </ul>
      <style jsx>{`
        .meta-data {
          list-style: none;
          padding: 0;
          margin: 0;
          margin-top: 25px;
        }
        .meta-data li {
          margin-top: 10px;
          background: rgba(255, 255, 255, 0.03);
          padding: 6px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
        }
        .meta-data li div {
          padding: 3px 6px;
        }
        .meta-data label {
          font-size: 12px;
          background: rgba(255, 255, 255, 0.1);
          padding: 3px 6px;
          border-radius: 5px;
          display: block;
        }
      `}</style>
    </>
  );
};

export default TransactionInfo;
