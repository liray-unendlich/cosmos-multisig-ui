import { MsgGrant } from "cosmjs-types/cosmos/authz/v1beta1/tx";
import { GenericAuthorization, SendAuthorization, StakeAuthorization } from "cosmjs-types/cosmos/authz/v1beta1/authz";
import HashView from "../HashView";
import { displayDate } from "../../../lib/dateHelpers";

interface TxMsgGrantDetailsProps {
  readonly msgValue: MsgGrant;
}

const TxMsgGrantDetails = ({ msgValue }: TxMsgGrantDetailsProps) => {
  const decodeAuthorization = () => {
    if (!msgValue.grant?.authorization) return "Unknown";
    
    const { typeUrl, value } = msgValue.grant.authorization;
    
    try {
      switch (typeUrl) {
        case "/cosmos.authz.v1beta1.GenericAuthorization": {
          const auth = GenericAuthorization.decode(value);
          return `Generic Authorization for ${auth.msg}`;
        }
        case "/cosmos.authz.v1beta1.SendAuthorization": {
          const auth = SendAuthorization.decode(value);
          const limits = auth.spendLimit?.map(coin => `${coin.amount} ${coin.denom}`).join(", ");
          return `Send Authorization${limits ? ` (Limit: ${limits})` : " (Unlimited)"}`;
        }
        case "/cosmos.authz.v1beta1.StakeAuthorization": {
          const auth = StakeAuthorization.decode(value);
          const authType = auth.authorizationType === 1 ? "Delegate" : 
                          auth.authorizationType === 2 ? "Undelegate" : 
                          auth.authorizationType === 3 ? "Redelegate" : "Unknown";
          const validators = auth.allowList?.address?.join(", ");
          return `Stake Authorization (${authType})${validators ? ` for validators: ${validators}` : ""}`;
        }
        default:
          return typeUrl;
      }
    } catch {
      return typeUrl;
    }
  };

  const expiration = msgValue.grant?.expiration ? 
    new Date(Number(msgValue.grant.expiration.seconds) * 1000) : 
    null;

  return (
    <>
      <li>
        <h3>MsgGrant</h3>
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
        <label>Authorization:</label>
        <div>{decodeAuthorization()}</div>
      </li>
      {expiration && (
        <li>
          <label>Expiration:</label>
          <div>{displayDate(expiration.toISOString())}</div>
        </li>
      )}
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

export default TxMsgGrantDetails;