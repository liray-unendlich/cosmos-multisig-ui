import { MsgGetter } from "..";
import { MsgTypeUrl, MsgTypeUrls } from "../../../../types/txMsg";
import { EncodeObject } from "@/lib/packages/proto-signing";
import MsgClaimRewardsForm from "./MsgClaimRewardsForm";
import MsgCreateVestingAccountForm from "./MsgCreateVestingAccountForm";
import MsgDelegateForm from "./MsgDelegateForm";
import MsgExecuteContractForm from "./MsgExecuteContractForm";
import MsgInstantiateContract2Form from "./MsgInstantiateContract2Form";
import MsgInstantiateContractForm from "./MsgInstantiateContractForm";
import MsgMigrateContractForm from "./MsgMigrateContractForm";
import MsgRedelegateForm from "./MsgRedelegateForm";
import MsgSendForm from "./MsgSendForm";
import MsgSetWithdrawAddressForm from "./MsgSetWithdrawAddressForm";
import MsgTransferForm from "./MsgTransferForm";
import MsgUndelegateForm from "./MsgUndelegateForm";
import MsgVoteForm from "./MsgVoteForm";
import MsgCreateValidatorForm from "./MsgCreateValidatorForm";
import MsgEditValidatorForm from "./MsgEditValidatorForm";
import MsgUnjailForm from "./MsgUnjailForm";
import MsgClaimValidatorCommissionForm from "./MsgClaimValidatorCommissionForm";
import MsgGrantForm from "./MsgGrantForm";
import MsgRevokeForm from "./MsgRevokeForm";
import MsgExecForm from "./MsgExecForm";
import MsgDepositForm from "./MsgDepositForm";
import MsgSubmitProposalForm from "./MsgSubmitProposalForm";
import MsgGrantAllowanceForm from "./MsgGrantAllowanceForm";
import MsgRevokeAllowanceForm from "./MsgRevokeAllowanceForm";

interface MsgFormProps {
  readonly msgType: MsgTypeUrl;
  readonly senderAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgForm = ({ msgType, senderAddress, ...restProps }: MsgFormProps) => {
  switch (msgType) {
    case MsgTypeUrls.Send:
      return <MsgSendForm fromAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Vote:
      return <MsgVoteForm voteAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.CreateValidator:
      return <MsgCreateValidatorForm delegatorAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.EditValidator:
      return <MsgEditValidatorForm delegatorAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Unjail:
      return <MsgUnjailForm delegatorAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.WithdrawValidatorCommission:
      return <MsgClaimValidatorCommissionForm delegatorAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Delegate:
      return <MsgDelegateForm delegatorAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Undelegate:
      return <MsgUndelegateForm delegatorAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.BeginRedelegate:
      return <MsgRedelegateForm delegatorAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.WithdrawDelegatorReward:
      return <MsgClaimRewardsForm delegatorAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.SetWithdrawAddress:
      return <MsgSetWithdrawAddressForm delegatorAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.CreateVestingAccount:
      return <MsgCreateVestingAccountForm fromAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Transfer:
      return <MsgTransferForm fromAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Execute:
      return <MsgExecuteContractForm fromAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Instantiate:
      return <MsgInstantiateContractForm fromAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Instantiate2:
      return <MsgInstantiateContract2Form fromAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Migrate:
      return <MsgMigrateContractForm fromAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Grant:
      return <MsgGrantForm granterAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Revoke:
      return <MsgRevokeForm granterAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Exec:
      return <MsgExecForm granteeAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Deposit: {
      const wrappedSetMsgGetter = (msgGetter: (senderAddr: string) => Promise<{ readonly typeUrl: string; readonly value: Record<string, unknown>; }>) => {
        msgGetter(senderAddress).then(msg => {
          const newMsgGetter: MsgGetter = {
            isMsgValid: () => true,
            msg: msg as EncodeObject
          };
          restProps.setMsgGetter(newMsgGetter);
        });
      };
      return <MsgDepositForm setMsgGetter={wrappedSetMsgGetter} deleteMsg={restProps.deleteMsg} />;
    }
    case MsgTypeUrls.SubmitProposal: {
      const wrappedSetMsgGetter = (msgGetter: (senderAddr: string) => Promise<{ readonly typeUrl: string; readonly value: Record<string, unknown>; }>) => {
        msgGetter(senderAddress).then(msg => {
          const newMsgGetter: MsgGetter = {
            isMsgValid: () => true,
            msg: msg as EncodeObject
          };
          restProps.setMsgGetter(newMsgGetter);
        });
      };
      return <MsgSubmitProposalForm setMsgGetter={wrappedSetMsgGetter} deleteMsg={restProps.deleteMsg} />;
    }
    case MsgTypeUrls.GrantAllowance: {
      const wrappedSetMsgGetter = (msgGetter: (senderAddr: string) => Promise<{ readonly typeUrl: string; readonly value: Record<string, unknown>; }>) => {
        msgGetter(senderAddress).then(msg => {
          const newMsgGetter: MsgGetter = {
            isMsgValid: () => true,
            msg: msg as EncodeObject
          };
          restProps.setMsgGetter(newMsgGetter);
        });
      };
      return <MsgGrantAllowanceForm setMsgGetter={wrappedSetMsgGetter} deleteMsg={restProps.deleteMsg} />;
    }
    case MsgTypeUrls.RevokeAllowance: {
      const wrappedSetMsgGetter = (msgGetter: (senderAddr: string) => Promise<{ readonly typeUrl: string; readonly value: Record<string, unknown>; }>) => {
        msgGetter(senderAddress).then(msg => {
          const newMsgGetter: MsgGetter = {
            isMsgValid: () => true,
            msg: msg as EncodeObject
          };
          restProps.setMsgGetter(newMsgGetter);
        });
      };
      return <MsgRevokeAllowanceForm setMsgGetter={wrappedSetMsgGetter} deleteMsg={restProps.deleteMsg} />;
    }
    default:
      return null;
  }
};

export default MsgForm;
