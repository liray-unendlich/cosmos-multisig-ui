import { MsgCodecs, MsgTypeUrls } from "@/types/txMsg";
import { Input } from "@/components/ui/input";
import { useChains } from "@/context/ChainsContext";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Any } from "cosmjs-types/google/protobuf/any";
import { BasicAllowance, PeriodicAllowance, AllowedMsgAllowance } from "cosmjs-types/cosmos/feegrant/v1beta1/feegrant";
import { Timestamp } from "cosmjs-types/google/protobuf/timestamp";

interface MsgGrantAllowanceFormValues {
  granterAddress: string;
  granteeAddress: string;
  allowanceType: "basic" | "periodic" | "allowed_msg";
  spendLimit: string;
  expiration: string;
  periodSeconds: string;
  periodSpendLimit: string;
  periodReset: string;
  allowedMessages: string;
}

interface MsgGrantAllowanceFormProps {
  readonly setMsgGetter: (
    msgGetter: (senderAddress: string) => Promise<{
      readonly typeUrl: string;
      readonly value: Record<string, unknown>;
    }>
  ) => void;
  readonly deleteMsg: () => void;
}

const MsgGrantAllowanceForm = ({ setMsgGetter, deleteMsg }: MsgGrantAllowanceFormProps) => {
  const { chain } = useChains();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<MsgGrantAllowanceFormValues>({
    defaultValues: {
      granterAddress: "",
      granteeAddress: "",
      allowanceType: "basic",
      spendLimit: "",
      expiration: "",
      periodSeconds: "",
      periodSpendLimit: "",
      periodReset: "",
      allowedMessages: "",
    },
  });

  const [msgJson, setMsgJson] = useState<Record<string, unknown>>();
  const [showMsg, setShowMsg] = useState(false);

  const allowanceType = watch("allowanceType");

  const createMsgGetter = (values: MsgGrantAllowanceFormValues) => async (senderAddress: string): Promise<{
    readonly typeUrl: string;
    readonly value: Record<string, unknown>;
  }> => {
    const granter = values.granterAddress || senderAddress;
    
    let allowance: Any;
    
    if (values.allowanceType === "basic") {
      const microAmount = values.spendLimit ? (Number(values.spendLimit) * 10 ** chain.displayDenomExponent).toString() : "0";
      const basicAllowance = BasicAllowance.fromPartial({
        spendLimit: microAmount ? [{
          denom: chain.assets?.[0]?.base || "uatom",
          amount: microAmount,
        }] : [],
        expiration: values.expiration ? Timestamp.fromPartial({
          seconds: BigInt(Math.floor(new Date(values.expiration).getTime() / 1000)),
          nanos: 0,
        }) : undefined,
      });
      
      allowance = Any.fromPartial({
        typeUrl: "/cosmos.feegrant.v1beta1.BasicAllowance",
        value: BasicAllowance.encode(basicAllowance).finish(),
      });
    } else if (values.allowanceType === "periodic") {
      const microAmount = values.periodSpendLimit ? (Number(values.periodSpendLimit) * 10 ** chain.displayDenomExponent).toString() : "0";
      const periodicAllowance = PeriodicAllowance.fromPartial({
        basic: BasicAllowance.fromPartial({
          spendLimit: values.spendLimit ? [{
            denom: chain.assets?.[0]?.base || "uatom",
            amount: (Number(values.spendLimit) * 10 ** chain.displayDenomExponent).toString(),
          }] : [],
          expiration: values.expiration ? Timestamp.fromPartial({
            seconds: BigInt(Math.floor(new Date(values.expiration).getTime() / 1000)),
            nanos: 0,
          }) : undefined,
        }),
        period: values.periodSeconds ? {
          seconds: BigInt(values.periodSeconds),
          nanos: 0,
        } : undefined,
        periodSpendLimit: microAmount ? [{
          denom: chain.assets?.[0]?.base || "uatom",
          amount: microAmount,
        }] : [],
        periodCanSpend: [],
        periodReset: values.periodReset ? Timestamp.fromPartial({
          seconds: BigInt(Math.floor(new Date(values.periodReset).getTime() / 1000)),
          nanos: 0,
        }) : undefined,
      });
      
      allowance = Any.fromPartial({
        typeUrl: "/cosmos.feegrant.v1beta1.PeriodicAllowance",
        value: PeriodicAllowance.encode(periodicAllowance).finish(),
      });
    } else {
      // AllowedMsgAllowance
      const msgList = values.allowedMessages.split(',').map(s => s.trim()).filter(s => s);
      const microAmount = values.spendLimit ? (Number(values.spendLimit) * 10 ** chain.displayDenomExponent).toString() : "0";
      
      const basicAllowance = BasicAllowance.fromPartial({
        spendLimit: microAmount ? [{
          denom: chain.assets?.[0]?.base || "uatom",
          amount: microAmount,
        }] : [],
        expiration: values.expiration ? Timestamp.fromPartial({
          seconds: BigInt(Math.floor(new Date(values.expiration).getTime() / 1000)),
          nanos: 0,
        }) : undefined,
      });
      
      const allowedMsgAllowance = AllowedMsgAllowance.fromPartial({
        allowance: Any.fromPartial({
          typeUrl: "/cosmos.feegrant.v1beta1.BasicAllowance",
          value: BasicAllowance.encode(basicAllowance).finish(),
        }),
        allowedMessages: msgList,
      });
      
      allowance = Any.fromPartial({
        typeUrl: "/cosmos.feegrant.v1beta1.AllowedMsgAllowance",
        value: AllowedMsgAllowance.encode(allowedMsgAllowance).finish(),
      });
    }

    const msgValue = MsgCodecs[MsgTypeUrls.GrantAllowance].fromPartial({
      granter,
      grantee: values.granteeAddress,
      allowance,
    });

    const msg = {
      typeUrl: MsgTypeUrls.GrantAllowance as string,
      value: msgValue as unknown as Record<string, unknown>,
    };

    setMsgJson(msg.value);
    return msg;
  };

  const submitForm = (values: MsgGrantAllowanceFormValues) => {
    setMsgGetter(createMsgGetter(values));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">MsgGrantAllowance</h3>
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

        <div>
          <label className="block text-sm font-medium mb-1">Allowance Type *</label>
          <select
            {...register("allowanceType", { required: "Allowance type is required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="basic">Basic Allowance</option>
            <option value="periodic">Periodic Allowance</option>
            <option value="allowed_msg">Allowed Message Allowance</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Spend Limit ({chain.displayDenom})
          </label>
          <Input
            type="number"
            step="0.000001"
            {...register("spendLimit")}
            placeholder="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Expiration Date</label>
          <Input
            type="datetime-local"
            {...register("expiration")}
          />
        </div>

        {allowanceType === "periodic" && (
          <>
            <div>
              <label className="block text-sm font-medium mb-1">Period (seconds)</label>
              <Input
                type="number"
                {...register("periodSeconds")}
                placeholder="86400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Period Spend Limit ({chain.displayDenom})
              </label>
              <Input
                type="number"
                step="0.000001"
                {...register("periodSpendLimit")}
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Period Reset</label>
              <Input
                type="datetime-local"
                {...register("periodReset")}
              />
            </div>
          </>
        )}

        {allowanceType === "allowed_msg" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Allowed Messages (comma-separated)
            </label>
            <Input
              {...register("allowedMessages")}
              placeholder="/cosmos.bank.v1beta1.MsgSend, /cosmos.staking.v1beta1.MsgDelegate"
            />
          </div>
        )}

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

export default MsgGrantAllowanceForm;