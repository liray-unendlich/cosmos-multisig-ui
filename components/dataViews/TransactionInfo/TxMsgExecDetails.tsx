import { MsgExec } from "cosmjs-types/cosmos/authz/v1beta1/tx";
import { Any } from "cosmjs-types/google/protobuf/any";
import HashView from "../HashView";

interface TxMsgExecDetailsProps {
  readonly msgValue: MsgExec;
}

const TxMsgExecDetails = ({ msgValue }: TxMsgExecDetailsProps) => {
  const decodeInnerMsg = (msg: Any) => {
    try {
      return msg.typeUrl || "Unknown message";
    } catch {
      return "Unable to decode message";
    }
  };

  return (
    <>
      <li>
        <h3>MsgExec</h3>
      </li>
      <li>
        <label>Grantee:</label>
        <div title={msgValue.grantee}>
          <HashView hash={msgValue.grantee} />
        </div>
      </li>
      <li>
        <label>Messages:</label>
        <ul>
          {msgValue.msgs.map((msg, index) => (
            <li key={index}>
              <div>{decodeInnerMsg(msg)}</div>
            </li>
          ))}
        </ul>
      </li>
      <style jsx>{`
        li {
          margin-top: 10px;
        }
        li:first-child {
          margin-top: 0;
        }
        label {
          font-weight: bold;
        }
        h3 {
          margin: 0;
        }
        ul {
          margin-top: 5px;
          margin-left: 20px;
        }
      `}</style>
    </>
  );
};

export default TxMsgExecDetails;