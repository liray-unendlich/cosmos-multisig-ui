import { EncodeObject } from "@cosmjs/proto-signing";
import { useEffect } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import StackableContainer from "../../../layout/StackableContainer";
import { toBech32, fromBech32} from "@cosmjs/encoding";

interface MsgUnjailFormProps {
  readonly delegatorAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgUnjailForm = ({
  delegatorAddress,
  setMsgGetter,
  deleteMsg,
}: MsgUnjailFormProps) => {
  const { chain } = useChains();

  // Safely generate validator address, fallback to placeholder if delegatorAddress is invalid
  const getValoperAddress = () => {
    try {
      // Skip bech32 operations for placeholder addresses
      if (delegatorAddress.includes('placeholder') || delegatorAddress.includes('qqq')) {
        return `${chain.addressPrefix}valoper1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq`;
      }
      
      const { data } = fromBech32(delegatorAddress);
      const valoperPrefix = chain.addressPrefix + 'valoper';
      return toBech32(valoperPrefix, data);
    } catch (error) {
      console.warn("Could not generate validator address:", error);
      return `${chain.addressPrefix}valoper1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq`;
    }
  };
  
  const valoperAddress = getValoperAddress();
  console.log("valoperAddress", valoperAddress);

  useEffect(() => {
     
    const isMsgValid = (): boolean => {
      return true;
    };

    const msgValue = MsgCodecs[MsgTypeUrls.Unjail].fromPartial({
      validatorAddr: valoperAddress,
    });

    const msg: EncodeObject = { typeUrl: MsgTypeUrls.Unjail, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [
    chain.addressPrefix,
    valoperAddress,
    setMsgGetter,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgUnjail</h2>
      <p>This will unjail the validator associated with this delegator address.</p>
      <p>Validator Address: <code>{valoperAddress}</code></p>
    </StackableContainer>
  );
};

export default MsgUnjailForm;
