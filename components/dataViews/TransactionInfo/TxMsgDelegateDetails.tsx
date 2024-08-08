import { assert } from "@/lib/packages/utils";

import { useChains } from "../../../context/ChainsContext";
import { printableCoin } from "../../../lib/displayHelpers";
import HashView from "../HashView";
import { MsgDelegate } from "cosmjs-types/cosmos/staking/v1beta1/tx";

interface TxMsgDelegateDetailsProps {
  readonly msgValue: MsgDelegate;
}

const TxMsgDelegateDetails = ({ msgValue }: TxMsgDelegateDetailsProps) => {
  const { chain } = useChains();
  assert(
    msgValue.amount,
    "Amount must be set, see https://github.com/osmosis-labs/telescope/issues/386",
  );

  return (
    <>
      <li>
        <h3>MsgDelegate</h3>
      </li>
      <li>
        <label>Amount:</label>
        <div>{printableCoin(msgValue.amount, chain)}</div>
      </li>
      <li>
        <label>Validator Address:</label>
        <div title={msgValue.validatorAddress}>
          <HashView hash={msgValue.validatorAddress} />
        </div>
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

export default TxMsgDelegateDetails;
