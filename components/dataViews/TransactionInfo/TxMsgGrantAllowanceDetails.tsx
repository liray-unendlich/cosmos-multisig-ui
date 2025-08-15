import { MsgGrantAllowance } from "cosmjs-types/cosmos/feegrant/v1beta1/tx";
import HashView from "../HashView";

interface TxMsgGrantAllowanceDetailsProps {
  readonly msgValue: MsgGrantAllowance;
}

const TxMsgGrantAllowanceDetails = ({ msgValue }: TxMsgGrantAllowanceDetailsProps) => {
  const getAllowanceType = () => {
    if (!msgValue.allowance) return "Unknown";
    const typeUrl = msgValue.allowance.typeUrl;
    if (typeUrl.includes("BasicAllowance")) return "Basic Allowance";
    if (typeUrl.includes("PeriodicAllowance")) return "Periodic Allowance";
    if (typeUrl.includes("AllowedMsgAllowance")) return "Allowed Message Allowance";
    return typeUrl;
  };

  return (
    <>
      <li>
        <h3>MsgGrantAllowance</h3>
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
        <label>Allowance Type:</label>
        <div>{getAllowanceType()}</div>
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

export default TxMsgGrantAllowanceDetails;