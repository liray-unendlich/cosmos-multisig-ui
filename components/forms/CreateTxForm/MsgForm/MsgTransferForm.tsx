import { MsgTransferEncodeObject } from "@/lib/packages/stargate";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import {
  datetimeLocalFromTimestamp,
  timestampFromDatetimeLocal,
} from "../../../../lib/dateHelpers";
import { checkAddress, exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

const humanTimestampOptions = [
  { label: "12 hours from now", value: 12 * 60 * 60 * 1000 },
  { label: "1 day from now", value: 24 * 60 * 60 * 1000 },
  { label: "2 days from now", value: 2 * 24 * 60 * 60 * 1000 },
  { label: "3 days from now", value: 3 * 24 * 60 * 60 * 1000 },
  { label: "7 days from now", value: 7 * 24 * 60 * 60 * 1000 },
  { label: "10 days from now", value: 10 * 24 * 60 * 60 * 1000 },
  { label: "2 weeks from now", value: 2 * 7 * 24 * 60 * 60 * 1000 },
  { label: "3 weeks from now", value: 3 * 7 * 24 * 60 * 60 * 1000 },
  { label: "1 month from now", value: 30 * 24 * 60 * 60 * 1000 },
];

interface MsgTransferFormProps {
  readonly fromAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgTransferForm = ({ fromAddress, setMsgGetter, deleteMsg }: MsgTransferFormProps) => {
  const { chain } = useChains();

  const [toAddress, setToAddress] = useState("");
  const [denom, setDenom] = useState("");
  const [amount, setAmount] = useState("0");
  const [sourcePort, setSourcePort] = useState("transfer");
  const [sourceChannel, setSourceChannel] = useState("");
  const [timeout, setTimeout] = useState(
    datetimeLocalFromTimestamp(Date.now() + humanTimestampOptions[0].value),
  );
  const [memo, setMemo] = useState("");

  const [toAddressError, setToAddressError] = useState("");
  const [denomError, setDenomError] = useState("");
  const [amountError, setAmountError] = useState("");
  const [sourcePortError, setSourcePortError] = useState("");
  const [sourceChannelError, setSourceChannelError] = useState("");
  const [timeoutError, setTimeoutError] = useState("");

  const trimmedInputs = trimStringsObj({
    toAddress,
    denom,
    amount,
    sourcePort,
    sourceChannel,
    timeout,
    memo,
  });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { toAddress, denom, amount, sourcePort, sourceChannel, timeout, memo } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setToAddressError("");
      setDenomError("");
      setAmountError("");
      setSourcePortError("");
      setSourceChannelError("");
      setTimeoutError("");

      const addressErrorMsg = checkAddress(toAddress, null); // Allow address from any chain
      if (addressErrorMsg) {
        setToAddressError(`Invalid address for network ${chain.chainId}: ${addressErrorMsg}`);
        return false;
      }

      if (!denom) {
        setDenomError("Denom is required");
        return false;
      }

      if (!amount || Number(amount) <= 0) {
        setAmountError("Amount must be greater than 0");
        return false;
      }

      if (!sourcePort) {
        setSourcePortError("Source port is required");
        return false;
      }

      if (!sourceChannel) {
        setSourceChannelError("Source channel is required");
        return false;
      }

      const timeoutDate = new Date(Number(timestampFromDatetimeLocal(timeout, "ms")));
      if (timeoutDate <= new Date()) {
        setTimeoutError("Timeout must be a date in the future");
        return false;
      }

      return true;
    };

    const msgValue = MsgCodecs[MsgTypeUrls.Transfer].fromPartial({
      sender: fromAddress,
      receiver: toAddress,
      token: { denom, amount },
      sourcePort,
      sourceChannel,
      timeoutTimestamp: timestampFromDatetimeLocal(timeout, "ns") as unknown as Long,
      memo,
    });

    const msg: MsgTransferEncodeObject = { typeUrl: MsgTypeUrls.Transfer, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [chain.chainId, fromAddress, setMsgGetter, trimmedInputs]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgTransfer</h2>
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
      <div className="form-item">
        <Input
          label="Denom"
          name="denom"
          value={denom}
          onChange={({ target }) => {
            setDenom(target.value);
            setDenomError("");
          }}
          error={denomError}
        />
      </div>
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
      <div className="form-item">
        <Input
          label="Source Port"
          name="source-port"
          value={sourcePort}
          onChange={({ target }) => {
            setSourcePort(target.value);
            setSourcePortError("");
          }}
          error={sourcePortError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Source Channel"
          name="source-channel"
          value={sourceChannel}
          onChange={({ target }) => {
            setSourceChannel(target.value);
            setSourceChannelError("");
          }}
          error={sourceChannelError}
        />
      </div>
      <div className="form-item">
        <Input
          type="datetime-local"
          list="timestamp-options"
          label="Timeout"
          name="timeout"
          value={timeout}
          onChange={({ target }) => {
            setTimeout(target.value);
            setTimeoutError("");
          }}
          error={timeoutError}
        />
        <datalist id="timestamp-options">
          {humanTimestampOptions.map(({ label, value }) => (
            <option key={label} value={datetimeLocalFromTimestamp(Date.now() + value)}>
              {label}
            </option>
          ))}
        </datalist>
      </div>
      <div className="form-item">
        <Input
          label="Memo"
          name="memo"
          value={memo}
          onChange={({ target }) => setMemo(target.value)}
        />
      </div>
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

export default MsgTransferForm;
