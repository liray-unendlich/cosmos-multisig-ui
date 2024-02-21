import { assert } from "@cosmjs/utils";
import { MsgVote } from "cosmjs-types/cosmos/gov/v1beta1/tx";

interface TxMsgVoteDetailsProps {
  readonly msgValue: MsgVote;
}

const options = [
  { value: 0, label: "Unspecified" },
  { value: 1, label: "Yes" },
  { value: 3, label: "No" },
  { value: 4, label: "No with veto" },
  { value: 2, label: "Abstain" },
] as const;

const TxMsgVoteDetails = ({ msgValue }: TxMsgVoteDetailsProps) => {
  assert(
    msgValue.proposalId,
    "Proposal ID must be set, see https://github.com/osmosis-labs/telescope/issues/386",
  );
  const option = options.find((o) => o.value === msgValue.option);
  console.log("option", option);
  return (
    <>
      <li>
        <h3>MsgVote</h3>
      </li>
      <li>
        <label>Proposal Id:</label>
        <div>{msgValue.proposalId.toString()}</div>
      </li>
      <li>
        <label>Vote Option:</label>
        <div>{option ? String(option.label) : ""}</div>
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

export default TxMsgVoteDetails;
