import { MsgSendEncodeObject } from "@cosmjs/stargate";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { displayCoinToBaseCoin } from "../../../../lib/coinHelpers";
import { checkAddress, exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { RegistryAsset } from "../../../../types/chainRegistry";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import Select from "../../../inputs/Select";
import StackableContainer from "../../../layout/StackableContainer";

const customDenomOption = { label: "Custom (enter denom below)", value: "custom" } as const;

const getDenomOptions = (assets: readonly RegistryAsset[]) => {
  if (!assets?.length) {
    return [customDenomOption];
  }

  return [...assets.map((asset) => ({ label: asset.symbol, value: asset })), customDenomOption];
};

interface MsgSendFormProps {
  readonly fromAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgSendForm = ({ fromAddress, setMsgGetter, deleteMsg }: MsgSendFormProps) => {
  const { chain } = useChains();

  const denomOptions = getDenomOptions(chain.assets);

  const [toAddress, setToAddress] = useState("");
  const [selectedDenom, setSelectedDenom] = useState(denomOptions[0]);
  const [customDenom, setCustomDenom] = useState("");
  const [amount, setAmount] = useState("0");

  const [toAddressError, setToAddressError] = useState("");
  const [customDenomError, setCustomDenomError] = useState("");
  const [amountError, setAmountError] = useState("");

  const trimmedInputs = trimStringsObj({ toAddress, customDenom, amount });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { toAddress, customDenom, amount } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setToAddressError("");
      setCustomDenomError("");
      setAmountError("");

      const addressErrorMsg = checkAddress(toAddress, chain.addressPrefix);
      if (addressErrorMsg) {
        setToAddressError(`Invalid address for network ${chain.chainId}: ${addressErrorMsg}`);
        return false;
      }

      if (
        selectedDenom.value === customDenomOption.value &&
        !customDenom &&
        amount &&
        amount !== "0"
      ) {
        setCustomDenomError("Custom denom must be set because of selection above");
        return false;
      }

      if (!amount || Number(amount) <= 0) {
        setAmountError("Amount must be greater than 0");
        return false;
      }

      if (selectedDenom.value === customDenomOption.value && !Number.isInteger(Number(amount))) {
        setAmountError("Amount cannot be decimal for custom denom");
        return false;
      }

      try {
        displayCoinToBaseCoin({ denom, amount }, chain.assets);
      } catch (e: unknown) {
        setAmountError(e instanceof Error ? e.message : "Could not set decimals");
        return false;
      }

      return true;
    };

    const denom =
      selectedDenom.value === customDenomOption.value ? customDenom : selectedDenom.value.symbol;

    const microCoin = (() => {
      try {
        if (!denom || !amount || amount === "0") {
          return null;
        }

        return displayCoinToBaseCoin({ denom, amount }, chain.assets);
      } catch {
        return null;
      }
    })();

    const msgValue = MsgCodecs[MsgTypeUrls.Send].fromPartial({
      fromAddress,
      toAddress,
      amount: microCoin ? [microCoin] : [],
    });

    const msg: MsgSendEncodeObject = { typeUrl: MsgTypeUrls.Send, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [
    chain.addressPrefix,
    chain.assets,
    chain.chainId,
    fromAddress,
    selectedDenom.value,
    setMsgGetter,
    trimmedInputs,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgSend</h2>
      <div className="form-item">
        <Input
          label="Recipient Address"
          name="recipient-address"
          value={toAddress}
          onChange={({ target }) => {
            setToAddress(target.value);
            setToAddressError("");
          }}
          error={toAddressError}
          placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
        />
      </div>
      <div className="form-item form-select">
        <label>Choose a denom:</label>
        <Select
          label="Select denom"
          name="denom-select"
          options={denomOptions}
          value={selectedDenom}
          onChange={(option: (typeof denomOptions)[number]) => {
            setSelectedDenom(option);
            if (option.value !== customDenomOption.value) {
              setCustomDenom("");
            }
            setCustomDenomError("");
          }}
        />
      </div>
      {selectedDenom.value === customDenomOption.value ? (
        <div className="form-item">
          <Input
            label="Custom denom"
            name="custom-denom"
            value={customDenom}
            onChange={({ target }) => {
              setCustomDenom(target.value);
              setCustomDenomError("");
            }}
            placeholder={
              selectedDenom.value === customDenomOption.value
                ? "Enter custom denom"
                : "Select Custom denom above"
            }
            disabled={selectedDenom.value !== customDenomOption.value}
            error={customDenomError}
          />
        </div>
      ) : null}
      <div className="form-item">
        <Input
          type="number"
          label="Amount"
          name="amount"
          value={amount}
          onChange={({ target }) => {
            setAmount(target.value);
            setAmountError("");
          }}
          error={amountError}
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

export default MsgSendForm;
