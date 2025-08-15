import { MsgRevokeAllowance } from "cosmjs-types/cosmos/feegrant/v1beta1/tx";
import HashView from "../HashView";

interface TxMsgRevokeAllowanceDetailsProps {
  readonly msgValue: MsgRevokeAllowance;
}

const TxMsgRevokeAllowanceDetails = ({ msgValue }: TxMsgRevokeAllowanceDetailsProps) => {
  return (
    <>
      <li>
        <h3>MsgRevokeAllowance</h3>
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

export default TxMsgRevokeAllowanceDetails;