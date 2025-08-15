import { MsgDeposit } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import HashView from "../HashView";
import { useChains } from "../../../context/ChainsContext";
import { printableCoin } from "../../../lib/displayHelpers";

interface TxMsgDepositDetailsProps {
  readonly msgValue: MsgDeposit;
}

const TxMsgDepositDetails = ({ msgValue }: TxMsgDepositDetailsProps) => {
  const { chain } = useChains();

  return (
    <>
      <li>
        <h3>MsgDeposit</h3>
      </li>
      <li>
        <label>Proposal ID:</label>
        <div>{msgValue.proposalId.toString()}</div>
      </li>
      <li>
        <label>Depositor:</label>
        <div title={msgValue.depositor}>
          <HashView hash={msgValue.depositor} />
        </div>
      </li>
      {msgValue.amount && msgValue.amount.length > 0 && (
        <li>
          <label>Amount:</label>
          <div>{msgValue.amount.map(coin => printableCoin(coin, chain)).join(", ")}</div>
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

export default TxMsgDepositDetails;