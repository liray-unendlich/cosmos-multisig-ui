import { MsgGetter } from "..";
import { MsgTypeUrl, MsgTypeUrls } from "../../../../types/txMsg";
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
    default:
      return null;
  }
};

export default MsgForm;
