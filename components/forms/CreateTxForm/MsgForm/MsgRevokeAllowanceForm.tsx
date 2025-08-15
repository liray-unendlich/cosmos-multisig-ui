import { MsgCodecs, MsgTypeUrls } from "@/types/txMsg";
import { Input } from "@/components/ui/input";
import { useChains } from "@/context/ChainsContext";
import { useState } from "react";
import { useForm } from "react-hook-form";

interface MsgRevokeAllowanceFormValues {
  granterAddress: string;
  granteeAddress: string;
}

interface MsgRevokeAllowanceFormProps {
  readonly setMsgGetter: (
    msgGetter: (senderAddress: string) => Promise<{
      readonly typeUrl: string;
      readonly value: Record<string, unknown>;
    }>
  ) => void;
  readonly deleteMsg: () => void;
}

const MsgRevokeAllowanceForm = ({ setMsgGetter, deleteMsg }: MsgRevokeAllowanceFormProps) => {
  const { chain } = useChains();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MsgRevokeAllowanceFormValues>({
    defaultValues: {
      granterAddress: "",
      granteeAddress: "",
    },
  });

  const [msgJson, setMsgJson] = useState<Record<string, unknown>>();
  const [showMsg, setShowMsg] = useState(false);

  const createMsgGetter = (values: MsgRevokeAllowanceFormValues) => async (senderAddress: string): Promise<{
    readonly typeUrl: string;
    readonly value: Record<string, unknown>;
  }> => {
    const granter = values.granterAddress || senderAddress;

    const msgValue = MsgCodecs[MsgTypeUrls.RevokeAllowance].fromPartial({
      granter,
      grantee: values.granteeAddress,
    });

    const msg = {
      typeUrl: MsgTypeUrls.RevokeAllowance as string,
      value: msgValue as unknown as Record<string, unknown>,
    };

    setMsgJson(msg.value);
    return msg;
  };

  const submitForm = (values: MsgRevokeAllowanceFormValues) => {
    setMsgGetter(createMsgGetter(values));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">MsgRevokeAllowance</h3>
      <form onSubmit={handleSubmit(submitForm)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Granter Address (leave empty for connected account)
          </label>
          <Input
            {...register("granterAddress")}
            placeholder={`${chain.addressPrefix}1...`}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Grantee Address *</label>
          <Input
            {...register("granteeAddress", { required: "Grantee address is required" })}
            placeholder={`${chain.addressPrefix}1...`}
          />
          {errors.granteeAddress && (
            <p className="text-red-500 text-sm mt-1">{errors.granteeAddress.message}</p>
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
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <pre>{JSON.stringify(msgJson, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default MsgRevokeAllowanceForm;