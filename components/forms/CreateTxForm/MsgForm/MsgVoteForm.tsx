import { MsgVoteEncodeObject } from "@cosmjs/stargate";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import { useChains } from "../../../../context/ChainsContext";
import Input from "../../../inputs/Input";
import Select from "../../../inputs/Select";
import StackableContainer from "../../../layout/StackableContainer";
import { VoteOption } from "cosmjs-types/cosmos/gov/v1beta1/gov";


interface MsgVoteFormProps {
  readonly voteAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

// 選択されたオプションの型を定義
interface SelectOption {
  value: VoteOption; // `VoteOption` は `cosmjs-types/cosmos/gov/v1beta1/gov` からインポートされた型
  label: string;
}

const MsgVoteForm = ({
  voteAddress,
  setMsgGetter,
  deleteMsg,
}: MsgVoteFormProps) => {
  const { chain } = useChains();
  const [proposalId, setProposalId] = useState("");
  // set option for vote
  const [option, setOption] = useState<VoteOption>();

  const [proposalIdError, setProposalIdError] = useState("");
  const [optionError, setOptionError] = useState("");

  useEffect(() => {
    // eslint-disable-next-line no-shadow

    const isMsgValid = (): boolean => {

      setProposalIdError("");
      setOptionError("");

      // check the proposalId is a valid integer
      const isProposalIdValid = Number.isInteger(Number(proposalId));
      if (isProposalIdValid === false) {
        setProposalIdError("Proposal ID must be a valid integer");
        return false;
      }
      // Validate option
      if (option === undefined) {
        setOptionError("You must select a vote option");
        return false;
      }

      return true;
    };

    let msgValue;

    if (voteAddress && proposalId && option !== undefined) {
      msgValue = MsgCodecs[MsgTypeUrls.Vote].fromPartial({
        voter: voteAddress,
        proposalId: proposalId,
        option: option,
      });

    }
    const msg: MsgVoteEncodeObject = { typeUrl: MsgTypeUrls.Vote, value: msgValue };
    console.log(chain);
    setMsgGetter({ isMsgValid, msg });
  }, [voteAddress, proposalId, option, setMsgGetter]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgExecuteContract</h2>
      <div className="form-item">
        <Input
          label="Proposal ID"
          name="proposal-id"
          value={proposalId}
          onChange={({ target }) => {
            setProposalId(target.value);
            setProposalIdError("");
          }}
          error={proposalIdError}
          placeholder={`E.g. 1`}
        />
      </div>
      <div className="form-item form-select">
        <label>Choose option:</label>
        <Select
          label="Choose vote option"
          name="vote-option"
          options={[ { value: 0, label: "Unspecified" }, { value: 1, label: "Yes" }, { value: 3, label: "No" }, { value: 4, label: "No with veto" }, { value: 2, label: "Abstain" } ]}
          onChange={( selectedOption: SelectOption ) => {
            setOption(selectedOption.value as VoteOption);
            setOptionError("");
          }}
        />
      </div>
      <style jsx>{`
        .form-item {
          margin-top: 1.5em;
        }
        .form-item label {
          font-style: italic;
          font-size: 12px;
        }
        .form-select {
          display: flex;
          flex-direction: column;
          gap: 0.8em;
        }
        button.remove {
          background: rgba(255, 255, 255, 0.2);
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: none;
          color: white;
          position: absolute;
          right: 10px;
          top: 10px;
        }
      `}</style>
    </StackableContainer>
  );
};

export default MsgVoteForm;
