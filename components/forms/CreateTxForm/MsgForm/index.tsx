import { MsgGetter } from "..";
import { MsgTypeUrl, MsgTypeUrls } from "../../../../types/txMsg";
import MsgWithdrawDelegatorRewardForm from "./MsgWithdrawDelegatorRewardForm";
import MsgCreateVestingAccountForm from "./MsgCreateVestingAccountForm";
import MsgDelegateForm from "./MsgDelegateForm";
import MsgExecuteContractForm from "./MsgExecuteContractForm";
import MsgInstantiateContract2Form from "./MsgInstantiateContract2Form";
import MsgInstantiateContractForm from "./MsgInstantiateContractForm";
import MsgMigrateContractForm from "./MsgMigrateContractForm";
import MsgBeginRedelegateForm from "./MsgBeginRedelegateForm";
import MsgSendForm from "./MsgSendForm";
import MsgSetWithdrawAddressForm from "./MsgSetWithdrawAddressForm";
import MsgTransferForm from "./MsgTransferForm";
import MsgUndelegateForm from "./MsgUndelegateForm";
import MsgVoteForm from "./MsgVoteForm";
import MsgCreateValidatorForm from "./MsgCreateValidatorForm";
import MsgEditValidatorForm from "./MsgEditValidatorForm";
import MsgUnjailForm from "./MsgUnjailForm";
import MsgWithdrawValidatorCommissionForm from "./MsgWithdrawValidatorCommissionForm";
import MsgFundCommunityPoolForm from "./MsgFundCommunityPoolForm";
import MsgUpdateAdminForm from "./MsgUpdateAdminForm";

interface MsgFormProps {
  readonly msgType: MsgTypeUrl;
  readonly senderAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgForm = ({ msgType, senderAddress, ...restProps }: MsgFormProps) => {
  switch (msgType) {
    case MsgTypeUrls.Send:
      return <MsgSendForm senderAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Vote:
      return <MsgVoteForm senderAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.CreateValidator:
      return <MsgCreateValidatorForm delegatorAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.EditValidator:
      return <MsgEditValidatorForm delegatorAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Unjail:
      return <MsgUnjailForm delegatorAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.WithdrawValidatorCommission:
      return <MsgWithdrawValidatorCommissionForm delegatorAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Delegate:
      return <MsgDelegateForm senderAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Undelegate:
      return <MsgUndelegateForm senderAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.BeginRedelegate:
      return <MsgBeginRedelegateForm senderAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.WithdrawDelegatorReward:
      return <MsgWithdrawDelegatorRewardForm senderAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.FundCommunityPool:
      return <MsgFundCommunityPoolForm senderAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.SetWithdrawAddress:
      return <MsgSetWithdrawAddressForm senderAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.CreateVestingAccount:
      return <MsgCreateVestingAccountForm senderAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.Transfer:
      return <MsgTransferForm senderAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.ExecuteContract:
      return <MsgExecuteContractForm senderAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.InstantiateContract:
      return <MsgInstantiateContractForm senderAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.InstantiateContract2:
      return <MsgInstantiateContract2Form senderAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.UpdateAdmin:
      return <MsgUpdateAdminForm senderAddress={senderAddress} {...restProps} />;
    case MsgTypeUrls.MigrateContract:
      return <MsgMigrateContractForm senderAddress={senderAddress} {...restProps} />;
    default:
      return null;
  }
};

export default MsgForm;
