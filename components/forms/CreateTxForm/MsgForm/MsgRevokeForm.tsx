import { EncodeObject } from "@/lib/packages/proto-signing";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { checkAddress, exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgRevokeFormProps {
  readonly granterAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgRevokeForm = ({ granterAddress, setMsgGetter, deleteMsg }: MsgRevokeFormProps) => {
  const { chain } = useChains();

  const [granteeAddress, setGranteeAddress] = useState("");
  const [msgTypeUrl, setMsgTypeUrl] = useState("");

  const [granteeAddressError, setGranteeAddressError] = useState("");
  const [msgTypeUrlError, setMsgTypeUrlError] = useState("");

  const trimmedInputs = trimStringsObj({ granteeAddress, msgTypeUrl });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { granteeAddress, msgTypeUrl } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setGranteeAddressError("");
      setMsgTypeUrlError("");

      const addressErrorMsg = checkAddress(granteeAddress, chain.addressPrefix);
      if (addressErrorMsg) {
        setGranteeAddressError(
          `Invalid address for network ${chain.chainId}: ${addressErrorMsg}`,
        );
        return false;
      }

      if (!msgTypeUrl) {
        setMsgTypeUrlError("Message type URL is required");
        return false;
      }

      if (!msgTypeUrl.startsWith("/")) {
        setMsgTypeUrlError("Message type URL must start with '/'");
        return false;
      }

      return true;
    };

    const msgValue = MsgCodecs[MsgTypeUrls.Revoke].fromPartial({
      granter: granterAddress,
      grantee: granteeAddress,
      msgTypeUrl,
    });

    const msg: EncodeObject = { typeUrl: MsgTypeUrls.Revoke, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [
    chain.addressPrefix,
    chain.chainId,
    granterAddress,
    setMsgGetter,
    trimmedInputs,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgRevoke</h2>
      
      <div className="form-item">
        <Input
          label="Grantee Address"
          name="grantee-address"
          value={granteeAddress}
          onChange={({ target }) => {
            setGranteeAddress(target.value);
            setGranteeAddressError("");
          }}
          error={granteeAddressError}
          placeholder={`E.g. ${exampleAddress(0, chain.addressPrefix)}`}
        />
      </div>

      <div className="form-item">
        <Input
          label="Message Type URL"
          name="msg-type-url"
          value={msgTypeUrl}
          onChange={({ target }) => {
            setMsgTypeUrl(target.value);
            setMsgTypeUrlError("");
          }}
          error={msgTypeUrlError}
          placeholder="E.g. /cosmos.bank.v1beta1.MsgSend"
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

export default MsgRevokeForm;