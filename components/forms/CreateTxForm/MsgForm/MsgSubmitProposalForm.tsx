import { MsgCodecs, MsgTypeUrls } from "@/types/txMsg";
import { Input } from "@/components/ui/input";
import { assert } from "@/lib/packages/utils";
import { useChains } from "@/context/ChainsContext";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TxMsgDetails } from "../TxMsgDetails";
import { Any } from "cosmjs-types/google/protobuf/any";
import { TextProposal } from "cosmjs-types/cosmos/gov/v1beta1/gov";

interface MsgSubmitProposalFormValues {
  proposerAddress: string;
  title: string;
  description: string;
  initialDepositAmount: string;
  proposalType: "text" | "community_pool_spend" | "parameter_change" | "software_upgrade";
}

interface MsgSubmitProposalFormProps {
  readonly setMsgGetter: (
    msgGetter: (senderAddress: string) => Promise<{
      readonly typeUrl: string;
      readonly value: any;
    }>
  ) => void;
  readonly deleteMsg: () => void;
}

const MsgSubmitProposalForm = ({ setMsgGetter, deleteMsg }: MsgSubmitProposalFormProps) => {
  const { chain } = useChains();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MsgSubmitProposalFormValues>({
    defaultValues: {
      proposerAddress: "",
      title: "",
      description: "",
      initialDepositAmount: "",
      proposalType: "text",
    },
  });

  const [msgJson, setMsgJson] = useState<any>();
  const [showMsg, setShowMsg] = useState(false);

  const proposalType = watch("proposalType");

  const createMsgGetter = (values: MsgSubmitProposalFormValues) => async (senderAddress: string) => {
    const proposer = values.proposerAddress || senderAddress;
    const microAmount = values.initialDepositAmount 
      ? (Number(values.initialDepositAmount) * 10 ** chain.displayDenomExponent).toString() 
      : "0";

    let content: Any;
    
    // For simplicity, we'll implement text proposals
    // Other types can be added based on requirements
    if (values.proposalType === "text") {
      const textProposal = TextProposal.fromPartial({
        title: values.title,
        description: values.description,
      });
      
      content = Any.fromPartial({
        typeUrl: "/cosmos.gov.v1beta1.TextProposal",
        value: TextProposal.encode(textProposal).finish(),
      });
    } else {
      // Placeholder for other proposal types
      const textProposal = TextProposal.fromPartial({
        title: values.title,
        description: values.description,
      });
      
      content = Any.fromPartial({
        typeUrl: "/cosmos.gov.v1beta1.TextProposal",
        value: TextProposal.encode(textProposal).finish(),
      });
    }

    const msgValue = MsgCodecs[MsgTypeUrls.SubmitProposal].fromPartial({
      content,
      initialDeposit: microAmount ? [
        {
          denom: chain.feeCurrencies[0].coinMinimalDenom,
          amount: microAmount,
        },
      ] : [],
      proposer,
    });

    const msg = {
      typeUrl: MsgTypeUrls.SubmitProposal,
      value: msgValue,
    };

    setMsgJson(msg.value);
    return msg;
  };

  const submitForm = (values: MsgSubmitProposalFormValues) => {
    setMsgGetter(createMsgGetter(values));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">MsgSubmitProposal</h3>
      <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Proposer Address (leave empty for connected account)
          </label>
          <Input
            {...register("proposerAddress")}
            placeholder={`${chain.addressPrefix}1...`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Proposal Type *</label>
          <select
            {...register("proposalType", { required: "Proposal type is required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="text">Text Proposal</option>
            <option value="community_pool_spend">Community Pool Spend</option>
            <option value="parameter_change">Parameter Change</option>
            <option value="software_upgrade">Software Upgrade</option>
          </select>
          {errors.proposalType && (
            <p className="text-red-500 text-sm mt-1">{errors.proposalType.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <Input
            {...register("title", { 
              required: "Title is required",
              minLength: { value: 3, message: "Title must be at least 3 characters" }
            })}
            placeholder="Proposal Title"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description *</label>
          <textarea
            {...register("description", { 
              required: "Description is required",
              minLength: { value: 10, message: "Description must be at least 10 characters" }
            })}
            placeholder="Proposal Description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={5}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Initial Deposit ({chain.displayDenom})
          </label>
          <Input
            type="number"
            step="0.000001"
            {...register("initialDepositAmount", {
              min: { value: 0, message: "Amount must be non-negative" }
            })}
            placeholder="0"
          />
          {errors.initialDepositAmount && (
            <p className="text-red-500 text-sm mt-1">{errors.initialDepositAmount.message}</p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create
          </button>
          <button
            type="button"
            onClick={() => setShowMsg(!showMsg)}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            {showMsg ? "Hide" : "Show"} Message
          </button>
          <button
            type="button"
            onClick={deleteMsg}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </form>

      {showMsg && msgJson && (
        <div className="mt-4">
          <TxMsgDetails msgValue={msgJson} />
        </div>
      )}
    </div>
  );
};

export default MsgSubmitProposalForm;