import { assert } from "@/lib/packages/utils";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import { thinSpace } from "../../../lib/displayHelpers";
import HashView from "../HashView";

interface TxMsgTransferDetailsProps {
  readonly msgValue: MsgTransfer;
}

const TxMsgTransferDetails = ({ msgValue }: TxMsgTransferDetailsProps) => {
  assert(
    msgValue.token,
    "Token must be set, same as https://github.com/osmosis-labs/telescope/issues/386",
  );
  const timeoutMilis = Number((msgValue.timeoutTimestamp as unknown as bigint) / 1_000_000n);
  const timeoutDateObj = new Date(timeoutMilis);
  const timeoutDate = timeoutDateObj.toLocaleDateString();
  const timeoutTime = timeoutDateObj.toLocaleTimeString();

  return (
    <>
      <li>
        <h3>MsgTransfer</h3>
      </li>
      <li>
        <label>Source Port:</label>
        <div>{msgValue.sourcePort}</div>
      </li>
      <li>
        <label>Source Channel:</label>
        <div>{msgValue.sourceChannel}</div>
      </li>
      <li>
        <label>Token:</label>
        <div>{msgValue.token.amount + thinSpace + msgValue.token.denom}</div>
      </li>
      <li>
        <label>To:</label>
        <div title={msgValue.receiver}>
          <HashView hash={msgValue.receiver} />
        </div>
      </li>
      <li>
        <label>Timeout:</label>
        <div>
          {timeoutDate} {timeoutTime}
        </div>
      </li>
      <li>
        <label>Memo:</label>
        <div>{msgValue.memo}</div>
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

export default TxMsgTransferDetails;
