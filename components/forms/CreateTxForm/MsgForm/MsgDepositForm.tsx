import { MsgCodecs, MsgTypeUrls } from "@/types/txMsg";
import { Input } from "@/components/ui/input";
import { assert } from "@/lib/packages/utils";
import { useChains } from "@/context/ChainsContext";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { TxMsgDetails } from "../TxMsgDetails";

interface MsgDepositFormValues {
  proposalId: string;
  depositorAddress: string;
  amount: string;
  denom: string;
}

interface MsgDepositFormProps {
  readonly setMsgGetter: (
    msgGetter: (senderAddress: string) => Promise<{
      readonly typeUrl: string;
      readonly value: any;
    }>
  ) => void;
  readonly deleteMsg: () => void;
}

const MsgDepositForm = ({ setMsgGetter, deleteMsg }: MsgDepositFormProps) => {
  const { chain } = useChains();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MsgDepositFormValues>({
    defaultValues: {
      proposalId: "",
      depositorAddress: "",
      amount: "",
      denom: chain.displayDenom,
    },
  });

  const [msgJson, setMsgJson] = useState<any>();
  const [showMsg, setShowMsg] = useState(false);

  const createMsgGetter = (values: MsgDepositFormValues) => async (senderAddress: string) => {
    const depositor = values.depositorAddress || senderAddress;
    const microAmount = values.amount ? (Number(values.amount) * 10 ** chain.displayDenomExponent).toString() : "0";

    const msgValue = MsgCodecs[MsgTypeUrls.Deposit].fromPartial({
      proposalId: BigInt(values.proposalId),
      depositor,
      amount: [
        {
          denom: chain.feeCurrencies[0].coinMinimalDenom,
          amount: microAmount,
        },
      ],
    });

    const msg = {
      typeUrl: MsgTypeUrls.Deposit,
      value: msgValue,
    };

    setMsgJson(msg.value);
    return msg;
  };

  const submitForm = (values: MsgDepositFormValues) => {
    setMsgGetter(createMsgGetter(values));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">MsgDeposit</h3>
      <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Proposal ID *</label>
          <Input
            type="number"
            {...register("proposalId", { 
              required: "Proposal ID is required",
              min: { value: 1, message: "Proposal ID must be positive" }
            })}
            placeholder="1"
          />
          {errors.proposalId && (
            <p className="text-red-500 text-sm mt-1">{errors.proposalId.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Depositor Address (leave empty for connected account)
          </label>
          <Input
            {...register("depositorAddress")}
            placeholder={`${chain.addressPrefix}1...`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Amount ({chain.displayDenom}) *
          </label>
          <Input
            type="number"
            step="0.000001"
            {...register("amount", { 
              required: "Amount is required",
              min: { value: 0.000001, message: "Amount must be positive" }
            })}
            placeholder="100"
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
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

export default MsgDepositForm;