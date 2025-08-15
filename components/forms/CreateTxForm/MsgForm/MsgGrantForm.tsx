import { EncodeObject } from "@/lib/packages/proto-signing";
import { GenericAuthorization, SendAuthorization, StakeAuthorization } from "cosmjs-types/cosmos/authz/v1beta1/authz";
import { Grant } from "cosmjs-types/cosmos/authz/v1beta1/authz";
import { Timestamp } from "cosmjs-types/google/protobuf/timestamp";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { displayCoinToBaseCoin } from "../../../../lib/coinHelpers";
import { checkAddress, exampleAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import Select from "../../../inputs/Select";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgGrantFormProps {
  readonly granterAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgGrantForm = ({ granterAddress, setMsgGetter, deleteMsg }: MsgGrantFormProps) => {
  const { chain } = useChains();

  const [granteeAddress, setGranteeAddress] = useState("");
  const [authorizationType, setAuthorizationType] = useState("send");
  const [msgTypeUrl, setMsgTypeUrl] = useState("");
  const [spendLimit, setSpendLimit] = useState("");
  const [validatorAddress, setValidatorAddress] = useState("");
  const [authorizationMode, setAuthorizationMode] = useState("DELEGATE");
  const [expirationDate, setExpirationDate] = useState("");

  const [granteeAddressError, setGranteeAddressError] = useState("");
  const [msgTypeUrlError, setMsgTypeUrlError] = useState("");
  const [spendLimitError, setSpendLimitError] = useState("");
  const [validatorAddressError, setValidatorAddressError] = useState("");
  const [expirationDateError, setExpirationDateError] = useState("");

  const trimmedInputs = trimStringsObj({ 
    granteeAddress, 
    msgTypeUrl, 
    spendLimit, 
    validatorAddress,
    expirationDate 
  });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { granteeAddress, msgTypeUrl, spendLimit, validatorAddress, expirationDate } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setGranteeAddressError("");
      setMsgTypeUrlError("");
      setSpendLimitError("");
      setValidatorAddressError("");
      setExpirationDateError("");

      const addressErrorMsg = checkAddress(granteeAddress, chain.addressPrefix);
      if (addressErrorMsg) {
        setGranteeAddressError(
          `Invalid address for network ${chain.chainId}: ${addressErrorMsg}`,
        );
        return false;
      }

      if (authorizationType === "generic" && !msgTypeUrl) {
        setMsgTypeUrlError("Message type URL is required for generic authorization");
        return false;
      }

      if (authorizationType === "send" && spendLimit) {
        try {
          displayCoinToBaseCoin({ denom: chain.displayDenom, amount: spendLimit }, chain.assets);
        } catch (e: unknown) {
          setSpendLimitError(e instanceof Error ? e.message : "Could not parse spend limit");
          return false;
        }
      }

      if (authorizationType === "stake" && validatorAddress) {
        const valAddrError = checkAddress(validatorAddress, chain.addressPrefix);
        if (valAddrError) {
          setValidatorAddressError(
            `Invalid validator address for network ${chain.chainId}: ${valAddrError}`,
          );
          return false;
        }
      }

      if (expirationDate) {
        const expDate = new Date(expirationDate);
        if (isNaN(expDate.getTime())) {
          setExpirationDateError("Invalid date format");
          return false;
        }
        if (expDate <= new Date()) {
          setExpirationDateError("Expiration date must be in the future");
          return false;
        }
      }

      return true;
    };

    const createAuthorization = () => {
      switch (authorizationType) {
        case "send": {
          const coins = spendLimit ? [{
            denom: displayCoinToBaseCoin(
              { denom: chain.displayDenom, amount: spendLimit }, 
              chain.assets
            ).denom,
            amount: displayCoinToBaseCoin(
              { denom: chain.displayDenom, amount: spendLimit }, 
              chain.assets
            ).amount,
          }] : [];
          
          return {
            typeUrl: "/cosmos.authz.v1beta1.SendAuthorization",
            value: SendAuthorization.encode(
              SendAuthorization.fromPartial({
                spendLimit: coins,
              })
            ).finish(),
          };
        }
        case "stake": {
          const allowList = validatorAddress ? { address: [validatorAddress] } : undefined;
          return {
            typeUrl: "/cosmos.authz.v1beta1.StakeAuthorization",
            value: StakeAuthorization.encode(
              StakeAuthorization.fromPartial({
                authorizationType: authorizationMode === "DELEGATE" ? 1 : 
                                  authorizationMode === "UNDELEGATE" ? 2 : 
                                  authorizationMode === "REDELEGATE" ? 3 : 1,
                allowList,
              })
            ).finish(),
          };
        }
        case "generic":
        default:
          return {
            typeUrl: "/cosmos.authz.v1beta1.GenericAuthorization",
            value: GenericAuthorization.encode(
              GenericAuthorization.fromPartial({
                msg: msgTypeUrl || "/cosmos.bank.v1beta1.MsgSend",
              })
            ).finish(),
          };
      }
    };

    const expiration = expirationDate ? 
      Timestamp.fromPartial({
        seconds: BigInt(Math.floor(new Date(expirationDate).getTime() / 1000)),
        nanos: 0,
      }) : undefined;

    const msgValue = MsgCodecs[MsgTypeUrls.Grant].fromPartial({
      granter: granterAddress,
      grantee: granteeAddress,
      grant: Grant.fromPartial({
        authorization: createAuthorization(),
        expiration,
      }),
    });

    const msg: EncodeObject = { typeUrl: MsgTypeUrls.Grant, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [
    chain.addressPrefix,
    chain.assets,
    chain.chainId,
    chain.displayDenom,
    granterAddress,
    setMsgGetter,
    trimmedInputs,
    authorizationType,
    authorizationMode,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgGrant</h2>
      
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
        <Select
          label="Authorization Type"
          name="authorization-type"
          value={authorizationType}
          onChange={({ target }) => setAuthorizationType(target.value)}
          options={[
            { value: "generic", label: "Generic Authorization" },
            { value: "send", label: "Send Authorization" },
            { value: "stake", label: "Stake Authorization" },
          ]}
        />
      </div>

      {authorizationType === "generic" && (
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
      )}

      {authorizationType === "send" && (
        <div className="form-item">
          <Input
            type="number"
            label={`Spend Limit (${chain.displayDenom}) - Optional`}
            name="spend-limit"
            value={spendLimit}
            onChange={({ target }) => {
              setSpendLimit(target.value);
              setSpendLimitError("");
            }}
            error={spendLimitError}
            placeholder="Leave empty for unlimited"
          />
        </div>
      )}

      {authorizationType === "stake" && (
        <>
          <div className="form-item">
            <Select
              label="Authorization Mode"
              name="authorization-mode"
              value={authorizationMode}
              onChange={({ target }) => setAuthorizationMode(target.value)}
              options={[
                { value: "DELEGATE", label: "Delegate" },
                { value: "UNDELEGATE", label: "Undelegate" },
                { value: "REDELEGATE", label: "Redelegate" },
              ]}
            />
          </div>
          <div className="form-item">
            <Input
              label="Validator Address (Optional)"
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
        </>
      )}

      <div className="form-item">
        <Input
          type="datetime-local"
          label="Expiration Date (Optional)"
          name="expiration-date"
          value={expirationDate}
          onChange={({ target }) => {
            setExpirationDate(target.value);
            setExpirationDateError("");
          }}
          error={expirationDateError}
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

export default MsgGrantForm;