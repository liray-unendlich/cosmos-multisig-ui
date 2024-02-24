import { assert } from "@cosmjs/utils";
import { MsgUnjail } from "cosmjs-types/cosmos/slashing/v1beta1/tx";

interface TxMsgUnjailDetailsProps {
  readonly msgValue: MsgUnjail;
}

const TxMsgUnjail = ({ msgValue }: TxMsgUnjailDetailsProps) => {
  assert(
    msgValue.validatorAddr,
    "Validator Address must be set",
  );
  return (
    <>
      <li>
        <h3>MsgUnjail</h3>
      </li>
      <li>
        <label>Validator Address:</label>
        <div>{msgValue.validatorAddr.toString()}</div>
      </li>
      <style jsx>{`
        li:not(:has(h3)) {
          background: rgba(255, 255, 255, 0.03);
          padding: 6px 10px;
          border-radius: 8px;
          display: flex;
          align-items: center;
        }
        li + li:nth-child(2) {
          margin-top: 25px;
        }
        li + li {
          margin-top: 10px;
        }
        li div {
          padding: 3px 6px;
        }
        label {
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

export default TxMsgUnjail;
