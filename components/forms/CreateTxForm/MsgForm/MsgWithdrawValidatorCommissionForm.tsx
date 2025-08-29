import SelectValidator from "@/components/SelectValidator";
import { EncodeObject } from "@cosmjs/proto-signing";
import { fromBech32, toBech32 } from "@cosmjs/encoding";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { checkAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgClaimValidatorCommissionFormProps {
  readonly delegatorAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgClaimValidatorCommissionForm = ({
  delegatorAddress,
  setMsgGetter,
  deleteMsg,
}: MsgClaimValidatorCommissionFormProps) => {
  const { chain } = useChains();

  const [validatorAddress, setValidatorAddress] = useState("");
  const [validatorAddressError, setValidatorAddressError] = useState("");

  // Initialize with auto-generated validator address if delegatorAddress exists
  useEffect(() => {
    if (delegatorAddress && validatorAddress === "") {
      try {
        const { data } = fromBech32(delegatorAddress);
        const valoperPrefix = chain.addressPrefix + "valoper";
        const valoperAddress = toBech32(valoperPrefix, data);
        setValidatorAddress(valoperAddress);
      } catch (error) {
        // If auto-generation fails, leave empty for manual selection
        console.warn("Could not auto-generate validator address:", error);
      }
    }
  }, [delegatorAddress, chain.addressPrefix, validatorAddress]);

  const trimmedInputs = trimStringsObj({ validatorAddress });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { validatorAddress } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setValidatorAddressError("");

      const addressErrorMsg = checkAddress(validatorAddress, chain.addressPrefix);
      if (addressErrorMsg) {
        setValidatorAddressError(
          `Invalid address for network ${chain.chainId}: ${addressErrorMsg}`,
        );
        return false;
      }

      return true;
    };

    const msgValue = MsgCodecs[MsgTypeUrls.WithdrawValidatorCommission].fromPartial({
      validatorAddress,
    });

    const msg: EncodeObject = { typeUrl: MsgTypeUrls.WithdrawValidatorCommission, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [chain.addressPrefix, chain.chainId, setMsgGetter, trimmedInputs]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgWithdrawValidatorCommission</h2>
      <div className="form-item">
        <SelectValidator
          selectedValidatorAddress={validatorAddress}
          setValidatorAddress={setValidatorAddress}
        />
        <Input
          label="Validator Address"
          name="validator-address"
          value={validatorAddress}
          onChange={({ target }) => {
            setValidatorAddress(target.value);
            setValidatorAddressError("");
          }}
          error={validatorAddressError}
          placeholder={`E.g. ${chain.addressPrefix}valoper...`}
        />
      </div>
      <style jsx>{`
        .form-item {
          margin-top: 1.5em;
        }
        button.remove {
          background: rgba(255, 255, 255, 0.2);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          color: white;
          position: absolute;
          right: 10px;
          top: 10px;
        }
      `}</style>
    </StackableContainer>
  );
};

export default MsgClaimValidatorCommissionForm;