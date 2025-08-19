import { MsgCodecs, MsgTypeUrls } from "@/types/txMsg";
import Input from "@/components/inputs/Input";
import Select from "@/components/inputs/Select";
import StackableContainer from "@/components/layout/StackableContainer";
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
    handleSubmit,
    watch,
    setValue,
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
  const [granterAddressError, setGranterAddressError] = useState("");
  const [granteeAddressError, setGranteeAddressError] = useState("");

  const allowanceType = watch("allowanceType");

  const allowanceOptions = [
    { label: "Basic Allowance", value: "basic" },
    { label: "Periodic Allowance", value: "periodic" },
    { label: "Allowed Message Allowance", value: "allowed_msg" },
  ];

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

  const selectedAllowanceType = allowanceOptions.find(option => option.value === allowanceType) || allowanceOptions[0];

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgGrantAllowance</h2>
      <form onSubmit={handleSubmit(submitForm)}>
        <div className="form-item">
          <Input
            label="Granter Address (leave empty for connected account)"
            name="granter-address"
            value={watch("granterAddress")}
            error={granterAddressError}
            placeholder={`${chain.addressPrefix}1...`}
            onChange={(e) => {
              setGranterAddressError("");
              setValue("granterAddress", e.target.value);
            }}
          />
        </div>

        <div className="form-item">
          <Input
            label="Grantee Address *"
            name="grantee-address"
            value={watch("granteeAddress")}
            error={granteeAddressError || errors.granteeAddress?.message}
            placeholder={`${chain.addressPrefix}1...`}
            onChange={(e) => {
              setGranteeAddressError("");
              setValue("granteeAddress", e.target.value);
            }}
          />
        </div>

        <div className="form-item form-select">
          <label>Allowance Type:</label>
          <Select
            label="Select allowance type"
            name="allowance-type"
            options={allowanceOptions}
            value={selectedAllowanceType}
            onChange={(option: typeof allowanceOptions[number]) => {
              setValue("allowanceType", option.value as "basic" | "periodic" | "allowed_msg");
            }}
          />
        </div>

        <div className="form-item">
          <Input
            label={`Spend Limit (${chain.displayDenom})`}
            name="spend-limit"
            type="number"
            step="0.000001"
            value={watch("spendLimit")}
            placeholder="100"
            onChange={(e) => setValue("spendLimit", e.target.value)}
          />
        </div>

        <div className="form-item">
          <Input
            label="Expiration Date"
            name="expiration"
            type="datetime-local"
            value={watch("expiration")}
            onChange={(e) => setValue("expiration", e.target.value)}
          />
        </div>

        {allowanceType === "periodic" && (
          <>
            <div className="form-item">
              <Input
                label="Period (seconds)"
                name="period-seconds"
                type="number"
                value={watch("periodSeconds")}
                placeholder="86400"
                onChange={(e) => setValue("periodSeconds", e.target.value)}
              />
            </div>
            <div className="form-item">
              <Input
                label={`Period Spend Limit (${chain.displayDenom})`}
                name="period-spend-limit"
                type="number"
                step="0.000001"
                value={watch("periodSpendLimit")}
                placeholder="10"
                onChange={(e) => setValue("periodSpendLimit", e.target.value)}
              />
            </div>
            <div className="form-item">
              <Input
                label="Period Reset"
                name="period-reset"
                type="datetime-local"
                value={watch("periodReset")}
                onChange={(e) => setValue("periodReset", e.target.value)}
              />
            </div>
          </>
        )}

        {allowanceType === "allowed_msg" && (
          <div className="form-item">
            <Input
              label="Allowed Messages (comma-separated)"
              name="allowed-messages"
              value={watch("allowedMessages")}
              placeholder="/cosmos.bank.v1beta1.MsgSend, /cosmos.staking.v1beta1.MsgDelegate"
              onChange={(e) => setValue("allowedMessages", e.target.value)}
            />
          </div>
        )}

        <button type="submit" className="create">
          Create
        </button>

        <button
          type="button"
          onClick={() => setShowMsg(!showMsg)}
          className="show"
        >
          {showMsg ? "Hide" : "Show"} Message
        </button>
      </form>

      {showMsg && msgJson && (
        <div className="form-item">
          <pre>{JSON.stringify(msgJson, null, 2)}</pre>
        </div>
      )}
    </StackableContainer>
  );
};

export default MsgGrantAllowanceForm;