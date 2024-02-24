import { EncodeObject } from "@cosmjs/proto-signing";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { exampleValidatorAddress } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";
import { toBech32, fromBech32} from "@cosmjs/encoding";

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
  // 委任者アドレスのデコード
  const { data } = fromBech32(delegatorAddress);
  // バリデータオペレーターアドレスのエンコード
  const valoperPrefix = chain.addressPrefix+'valoper';
  const valoperAddress = toBech32(valoperPrefix, data);
  console.log("valoperAddress", valoperAddress);

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const isMsgValid = (): boolean => {
      setValidatorAddressError("");
      // validatorAddress validation it should be a valid bech32 address
      if (!validatorAddress || !validatorAddress.startsWith(chain.addressPrefix+"valoper")) {
        setValidatorAddressError("Validator Address must be a valid bech32 operator address");
        return false;
      }
      return true;
    };

    const msgValue = MsgCodecs[MsgTypeUrls.WithdrawValidatorCommission].fromPartial({
      validatorAddress: validatorAddress,
    });

    const msg: EncodeObject = { typeUrl: MsgTypeUrls.WithdrawValidatorCommission, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [
    chain.addressPrefix,
    validatorAddress,
    setMsgGetter,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgUnjail</h2>
      <div className="form-item">
        <Input
          label="Validator Operator Address"
          name="validator-pubkey"
          value={validatorAddress}
          onChange={({ target }) => {
            setValidatorAddress(target.value);
            setValidatorAddressError("");
          }}
          error={validatorAddressError}
          placeholder={`E.g. ${exampleValidatorAddress(0, chain.addressPrefix)}`}
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
