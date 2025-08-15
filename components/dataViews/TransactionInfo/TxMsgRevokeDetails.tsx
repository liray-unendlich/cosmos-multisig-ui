import { MsgRevoke } from "cosmjs-types/cosmos/authz/v1beta1/tx";
import HashView from "../HashView";

interface TxMsgRevokeDetailsProps {
  readonly msgValue: MsgRevoke;
}

const TxMsgRevokeDetails = ({ msgValue }: TxMsgRevokeDetailsProps) => {
  return (
    <>
      <li>
        <h3>MsgRevoke</h3>
      </li>
      <li>
        <label>Granter:</label>
        <div title={msgValue.granter}>
          <HashView hash={msgValue.granter} />
        </div>
      </li>
      <li>
        <label>Grantee:</label>
        <div title={msgValue.grantee}>
          <HashView hash={msgValue.grantee} />
        </div>
      </li>
      <li>
        <label>Message Type URL:</label>
        <div>{msgValue.msgTypeUrl}</div>
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
      `}</style>
    </>
  );
};

export default TxMsgRevokeDetails;