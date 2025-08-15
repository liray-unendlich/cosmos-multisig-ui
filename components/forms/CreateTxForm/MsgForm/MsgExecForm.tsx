import { EncodeObject } from "@/lib/packages/proto-signing";
import { Any } from "cosmjs-types/google/protobuf/any";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { checkAddress, exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import { displayCoinToBaseCoin } from "../../../../lib/coinHelpers";
import Input from "../../../inputs/Input";
import Select from "../../../inputs/Select";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgExecFormProps {
  readonly granteeAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgExecForm = ({ granteeAddress, setMsgGetter, deleteMsg }: MsgExecFormProps) => {
  const { chain } = useChains();

  const [msgType, setMsgType] = useState("send");
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [validatorAddress, setValidatorAddress] = useState("");
  const [customMsgJson, setCustomMsgJson] = useState("");

  const [fromAddressError, setFromAddressError] = useState("");
  const [toAddressError, setToAddressError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [validatorAddressError, setValidatorAddressError] = useState("");
  const [customMsgJsonError, setCustomMsgJsonError] = useState("");

  const trimmedInputs = trimStringsObj({ 
    fromAddress, 
    toAddress, 
    amount, 
    validatorAddress,
    customMsgJson 
  });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { fromAddress, toAddress, amount, validatorAddress, customMsgJson } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setFromAddressError("");
      setToAddressError("");
      setAmountError("");
      setValidatorAddressError("");
      setCustomMsgJsonError("");

      if (msgType === "custom") {
        try {
          if (!customMsgJson) {
            setCustomMsgJsonError("Custom message JSON is required");
            return false;
          }
          JSON.parse(customMsgJson);
        } catch {
          setCustomMsgJsonError("Invalid JSON format");
          return false;
        }
        return true;
      }

      const fromAddressErr = checkAddress(fromAddress, chain.addressPrefix);
      if (fromAddressErr) {
        setFromAddressError(
          `Invalid from address for network ${chain.chainId}: ${fromAddressErr}`,
        );
        return false;
      }

      if (msgType === "send") {
        const toAddressErr = checkAddress(toAddress, chain.addressPrefix);
        if (toAddressErr) {
          setToAddressError(
            `Invalid to address for network ${chain.chainId}: ${toAddressErr}`,
          );
          return false;
        }

        if (!amount || Number(amount) <= 0) {
          setAmountError("Amount must be greater than 0");
          return false;
        }

        try {
          displayCoinToBaseCoin({ denom: chain.displayDenom, amount }, chain.assets);
        } catch (e: unknown) {
          setAmountError(e instanceof Error ? e.message : "Could not parse amount");
          return false;
        }
      }

      if ((msgType === "delegate" || msgType === "undelegate") && validatorAddress) {
        const valAddrError = checkAddress(validatorAddress, chain.addressPrefix);
        if (valAddrError) {
          setValidatorAddressError(
            `Invalid validator address for network ${chain.chainId}: ${valAddrError}`,
          );
          return false;
        }

        if (!amount || Number(amount) <= 0) {
          setAmountError("Amount must be greater than 0");
          return false;
        }
      }

      return true;
    };

    const createInnerMsg = (): Any => {
      if (msgType === "custom") {
        try {
          const msgData = JSON.parse(customMsgJson);
          return Any.fromPartial(msgData);
        } catch {
          return Any.fromPartial({});
        }
      }

      switch (msgType) {
        case "send": {
          const microCoin = displayCoinToBaseCoin(
            { denom: chain.displayDenom, amount }, 
            chain.assets
          );
          const msgSend = MsgCodecs[MsgTypeUrls.Send].fromPartial({
            fromAddress,
            toAddress,
            amount: [microCoin],
          });
          return Any.fromPartial({
            typeUrl: MsgTypeUrls.Send,
            value: MsgCodecs[MsgTypeUrls.Send].encode(msgSend).finish(),
          });
        }
        case "delegate": {
          const microCoin = displayCoinToBaseCoin(
            { denom: chain.displayDenom, amount }, 
            chain.assets
          );
          const msgDelegate = MsgCodecs[MsgTypeUrls.Delegate].fromPartial({
            delegatorAddress: fromAddress,
            validatorAddress,
            amount: microCoin,
          });
          return Any.fromPartial({
            typeUrl: MsgTypeUrls.Delegate,
            value: MsgCodecs[MsgTypeUrls.Delegate].encode(msgDelegate).finish(),
          });
        }
        case "undelegate": {
          const microCoin = displayCoinToBaseCoin(
            { denom: chain.displayDenom, amount }, 
            chain.assets
          );
          const msgUndelegate = MsgCodecs[MsgTypeUrls.Undelegate].fromPartial({
            delegatorAddress: fromAddress,
            validatorAddress,
            amount: microCoin,
          });
          return Any.fromPartial({
            typeUrl: MsgTypeUrls.Undelegate,
            value: MsgCodecs[MsgTypeUrls.Undelegate].encode(msgUndelegate).finish(),
          });
        }
        default:
          return Any.fromPartial({});
      }
    };

    const msgValue = MsgCodecs[MsgTypeUrls.Exec].fromPartial({
      grantee: granteeAddress,
      msgs: [createInnerMsg()],
    });

    const msg: EncodeObject = { typeUrl: MsgTypeUrls.Exec, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [
    chain.addressPrefix,
    chain.assets,
    chain.chainId,
    chain.displayDenom,
    granteeAddress,
    setMsgGetter,
    trimmedInputs,
    msgType,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgExec</h2>
      
      <div className="form-item">
        <Select
          label="Message Type"
          name="msg-type"
          value={msgType}
          onChange={({ target }) => setMsgType(target.value)}
          options={[
            { value: "send", label: "Send" },
            { value: "delegate", label: "Delegate" },
            { value: "undelegate", label: "Undelegate" },
            { value: "custom", label: "Custom Message" },
          ]}
        />
      </div>

      {msgType === "custom" ? (
        <div className="form-item">
          <label>Custom Message JSON</label>
          <textarea
            name="custom-msg-json"
            value={customMsgJson}
            onChange={({ target }) => {
              setCustomMsgJson(target.value);
              setCustomMsgJsonError("");
            }}
            placeholder='{"typeUrl": "/cosmos.bank.v1beta1.MsgSend", "value": {...}}'
            rows={10}
            style={{ width: "100%", padding: "8px", borderRadius: "4px" }}
          />
          {customMsgJsonError && (
            <div style={{ color: "red", marginTop: "4px" }}>{customMsgJsonError}</div>
          )}
        </div>
      ) : (
        <>
          <div className="form-item">
            <Input
              label="From Address (Granter)"
              name="from-address"
              value={fromAddress}
              onChange={({ target }) => {
                setFromAddress(target.value);
                setFromAddressError("");
              }}
              error={fromAddressError}
              placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
            />
          </div>

          {msgType === "send" && (
            <div className="form-item">
              <Input
                label="To Address"
                name="to-address"
                value={toAddress}
                onChange={({ target }) => {
                  setToAddress(target.value);
                  setToAddressError("");
                }}
                error={toAddressError}
                placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
              />
            </div>
          )}

          {(msgType === "delegate" || msgType === "undelegate") && (
            <div className="form-item">
              <Input
                label="Validator Address"
                name="validator-address"
                value={validatorAddress}
                onChange={({ target }) => {
                  setValidatorAddress(target.value);
                  setValidatorAddressError("");
                }}
                error={validatorAddressError}
                placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
              />
            </div>
          )}

          {(msgType === "send" || msgType === "delegate" || msgType === "undelegate") && (
            <div className="form-item">
              <Input
                type="number"
                label={`Amount (${chain.displayDenom})`}
                name="amount"
                value={amount}
                onChange={({ target }) => {
                  setAmount(target.value);
                  setAmountError("");
                }}
                error={amountError}
              />
            </div>
          )}
        </>
      )}

      <style jsx>{`
        .form-item {
          margin-top: 1.5em;
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

export default MsgExecForm;