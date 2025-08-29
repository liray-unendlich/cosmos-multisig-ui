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

  // 委任者アドレスのデコード
  const { data } = fromBech32(delegatorAddress);
  // バリデータオペレーターアドレスのエンコード
  const valoperPrefix = chain.addressPrefix+'valoper';
  const valoperAddress = toBech32(valoperPrefix, data);
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
      <div className="form-item">
        validatorAddress: {valoperAddress}
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

export default MsgUnjailForm;
