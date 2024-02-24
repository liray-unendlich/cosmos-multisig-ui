import { assert } from "@cosmjs/utils";
import { MsgEditValidator } from "cosmjs-types/cosmos/staking/v1beta1/tx";

interface TxMsgEditValidatorDetailsProps {
  readonly msgValue: MsgEditValidator;
}

const TxMsgEditValidatorDetails = ({ msgValue }: TxMsgEditValidatorDetailsProps) => {
  assert(
    msgValue.validatorAddress,
    "Validator Address must be set, see https://github.com/osmosis-labs/telescope/issues/386",
  );
  console.log(msgValue);
  return (
    <>
      <li>
        <h3>MsgEditValidator</h3>
      </li>
      <li>
        <label>Validator Address:</label>
        <div>{msgValue.validatorAddress.toString()}</div>
      </li>
      <li>
        <label>Description Changed:</label>
        <div>{(msgValue.description.moniker ? "moniker: "+String(msgValue.description.moniker) : "")+(msgValue.description.details ? "details: "+String(msgValue.description.details) : "")+(msgValue.description.identity ? "identity: "+String(msgValue.description.identity) : "")+(msgValue.description.website ? "website: "+String(msgValue.description.website) : "")+(msgValue.description.securityContact ? "securityContact: "+String(msgValue.description.securityContact) : "")}</div>
      </li>
      <li>
        <label>Commission Rate Changed:</label>
        <div>{msgValue.commissionRate ? "commissionRate: "+String(parseFloat(msgValue.commissionRate)/10**16)+"%" : ""}</div>
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

export default TxMsgEditValidatorDetails;
