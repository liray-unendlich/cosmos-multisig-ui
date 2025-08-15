import { MsgSubmitProposal } from "cosmjs-types/cosmos/gov/v1beta1/tx";
import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";
import HashView from "../HashView";
import { useChains } from "../../../context/ChainsContext";
import { printableCoin } from "../../../lib/displayHelpers";

interface TxMsgSubmitProposalDetailsProps {
  readonly msgValue: MsgSubmitProposal;
}

const TxMsgSubmitProposalDetails = ({ msgValue }: TxMsgSubmitProposalDetailsProps) => {
  const { chain } = useChains();

  const decodeProposalContent = () => {
    try {
      if (msgValue.content?.typeUrl === "/cosmos.gov.v1beta1.TextProposal") {
        const proposal = TextProposal.decode(msgValue.content.value);
        return {
          type: "Text Proposal",
          title: proposal.title,
          description: proposal.description,
        };
      }
      return {
        type: msgValue.content?.typeUrl || "Unknown",
        title: "Unable to decode",
        description: "Unable to decode",
      };
    } catch {
      return {
        type: "Unknown",
        title: "Unable to decode",
        description: "Unable to decode",
      };
    }
  };

  const content = decodeProposalContent();

  return (
    <>
      <li>
        <h3>MsgSubmitProposal</h3>
      </li>
      <li>
        <label>Proposer:</label>
        <div title={msgValue.proposer}>
          <HashView hash={msgValue.proposer} />
        </div>
      </li>
      <li>
        <label>Proposal Type:</label>
        <div>{content.type}</div>
      </li>
      <li>
        <label>Title:</label>
        <div>{content.title}</div>
      </li>
      <li>
        <label>Description:</label>
        <div>{content.description}</div>
      </li>
      {msgValue.initialDeposit && msgValue.initialDeposit.length > 0 && (
        <li>
          <label>Initial Deposit:</label>
          <div>{msgValue.initialDeposit.map(coin => printableCoin(coin, chain)).join(", ")}</div>
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

export default TxMsgSubmitProposalDetails;