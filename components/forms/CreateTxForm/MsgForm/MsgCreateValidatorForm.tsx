import { MsgCreateValidatorEncodeObject } from "@cosmjs/stargate";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { macroCoinToMicroCoin } from "../../../../lib/coinHelpers";
import { exampleValidatorAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgCreateValidatorFormProps {
  readonly delegatorAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgCreateValidatorForm = ({
  delegatorAddress,
  setMsgGetter,
  deleteMsg,
}: MsgCreateValidatorFormProps) => {
  const { chain } = useChains();

  // set amount, validator pubkey, commission-rate, commission-max, commission-max-change-rate, min-self-delegation, moniker, details, website, security-contact
  const [amount, setAmount] = useState("0");
  const [validatorAddress, setValidatorAddress] = useState("");
  const [validatorPubkey, setValidatorPubkey] = useState("");
  const [commissionRate, setCommissionRate] = useState("0");
  const [commissionMax, setCommissionMax] = useState("0");
  const [commissionMaxChangeRate, setCommissionMaxChangeRate] = useState("0");
  const [minSelfDelegation, setMinSelfDelegation] = useState("0");
  const [moniker, setMoniker] = useState("");
  const [details, setDetails] = useState("");
  const [website, setWebsite] = useState("");
  const [securityContact, setSecurityContact] = useState("");

  // set validatorAddressError and amountError, pubkeyError, commissionRateError, commissionMaxError, commissionMaxChangeRateError, minSelfDelegationError, monikerError, detailsError, websiteError, securityContactError
  const [amountError, setAmountError] = useState("");
  const [validatorAddressError, setValidatorAddressError] = useState("");
  const [validatorPubkeyError, setValidatorPubkeyError] = useState("");
  const [commissionRateError, setCommissionRateError] = useState("");
  const [commissionMaxError, setCommissionMaxError] = useState("");
  const [commissionMaxChangeRateError, setCommissionMaxChangeRateError] = useState("");
  const [minSelfDelegationError, setMinSelfDelegationError] = useState("");
  const [monikerError, setMonikerError] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [websiteError, setWebsiteError] = useState("");
  const [securityContactError, setSecurityContactError] = useState("");

  const trimmedInputs = trimStringsObj({ amount, validatorAddress,validatorPubkey, commissionRate, commissionMax, commissionMaxChangeRate, minSelfDelegation, moniker, details, website, securityContact });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { amount, validatorPubkey, commissionRate, commissionMax, commissionMaxChangeRate, minSelfDelegation, moniker, details, website, securityContact } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setAmountError("");
      setValidatorPubkeyError("");
      setCommissionRateError("");
      setCommissionMaxError("");
      setCommissionMaxChangeRateError("");
      setMinSelfDelegationError("");
      setMonikerError("");


      // amount validation
      if (!amount || Number(amount) <= 0) {
        setAmountError("Amount must be greater than 0");
        return false;
      }
      
      // validatorAddress validation it should be start with chain.addressPrefix and "valoper" and length should be 43 
      if (!validatorAddress ) {
        setValidatorAddressError(`Validator Address must be valid address for network ${chain.chainId}`);
        return false;
      }

      // pubkey validation.
      if (!validatorPubkey ) {
        setValidatorPubkeyError(`Validator Pubkey must be provided`);
        return false;
      }

      // commissionRate validation it should be greater than 0 and less than 1 and less than commissionMax
      if (!commissionRate || Number(commissionRate) <= 0 || Number(commissionRate) >= 1 || Number(commissionRate) >= Number(commissionMax)) {
        setCommissionRateError("Commission Rate must be greater than 0 and less than 1 and less than Commission Max");
        return false;
      }

      // commissionMax validation it should be greater than 0 and less than 1 and greater than commissionRate
      if (!commissionMax || Number(commissionMax) <= 0 || Number(commissionMax) >= 1 || Number(commissionMax) <= Number(commissionRate)) {
        setCommissionMaxError("Commission Max must be greater than 0 and less than 1 and greater than Commission Rate");
        return false;
      }

      // commissionMaxChangeRate validation it should be greater than 0 and less than 1
      if (!commissionMaxChangeRate || Number(commissionMaxChangeRate) <= 0 || Number(commissionMaxChangeRate) >= 1) {
        setCommissionMaxChangeRateError("Commission Max Change Rate must be greater than 0 and less than 1");
        return false;
      }

      // minSelfDelegation validation it should be greater than 0
      if (!minSelfDelegation || Number(minSelfDelegation) <= 0) {
        setMinSelfDelegationError("Min Self Delegation must be greater than 0");
        return false;
      }

      // moniker validation it should be provided
      if (!moniker) {
        setMonikerError("Moniker must be provided");
        return false;
      }

      // website validation it should be a valid url like "https://xx.com"
      if (website && !website.startsWith("https://")) {
        setWebsiteError("Website must be a valid url like https://xx.com");
        return false;
      }

      // securityContact validation it should be a valid email address
      if (securityContact && !securityContact.includes("@")) {
        setSecurityContactError("Security Contact must be a valid email address");
        return false;
      }

      return true;
    };

    const microCoin = (() => {
      try {
        return macroCoinToMicroCoin({ denom: chain.displayDenom, amount }, chain.assets);
      } catch {
        return { denom: chain.displayDenom, amount: "0" };
      }
    })();
    
    const msgValue = MsgCodecs[MsgTypeUrls.Validator].fromPartial({
      delegatorAddress,
      validatorAddress: validatorAddress,
      pubkey: {
        typeUrl: "/cosmos.crypto.ed25519.PubKey",
        value: new TextEncoder().encode(validatorPubkey),
      },
      value: microCoin,
      commission: {
        rate: commissionRate,
        maxRate: commissionMax,
        maxChangeRate: commissionMaxChangeRate,
      },
      minSelfDelegation,
      description: {
        moniker,
        details,
        website,
        securityContact,
      },
    });

    const msg: MsgCreateValidatorEncodeObject  = { typeUrl: MsgTypeUrls.Validator, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [
    chain.addressPrefix,
    chain.assets,
    chain.chainId,
    chain.displayDenom,
    delegatorAddress,
    setMsgGetter,
    trimmedInputs,
    validatorAddress, // Add 'validatorAddress' as a dependency
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgCreateValidator</h2>
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
          placeholder={`E.g. ${exampleValidatorAddress(0, chain.addressPrefix)}`}
        />
      </div>
      <div className="form-item">
        <Input
          label="Validator Pubkey"
          name="validator-pubkey"
          value={validatorPubkey}
          onChange={({ target }) => {
            setValidatorPubkey(target.value);
            setValidatorPubkeyError("");
          }}
          error={validatorPubkeyError}
          placeholder={`E.g. ${exampleValidatorAddress(0, chain.addressPrefix)}`}
        />
      </div>
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
      <div className="form-item">
        <Input
          type="number"
          label={`Commission Rate`}
          name="commission-rate"
          value={commissionRate}
          onChange={({ target }) => {
            setCommissionRate(target.value);
            setCommissionRateError("");
          }}
          error={commissionRateError}
        />
      </div>
      <div className="form-item">
        <Input
          type="number"
          label={`Commission Max`}
          name="commission-max"
          value={commissionMax}
          onChange={({ target }) => {
            setCommissionMax(target.value);
            setCommissionMaxError("");
          }}
          error={commissionMaxError}
        />
      </div>
      <div className="form-item">
        <Input
          type="number"
          label={`Commission Max Change Rate`}
          name="commission-max-change-rate"
          value={commissionMaxChangeRate}
          onChange={({ target }) => {
            setCommissionMaxChangeRate(target.value);
            setCommissionMaxChangeRateError("");
          }}
          error={commissionMaxChangeRateError}
        />
      </div>
      <div className="form-item">
        <Input
          type="number"
          label={`Min Self Delegation`}
          name="min-self-delegation"
          value={minSelfDelegation}
          onChange={({ target }) => {
            setMinSelfDelegation(target.value);
            setMinSelfDelegationError("");
          }}
          error={minSelfDelegationError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Moniker"
          name="moniker"
          value={moniker}
          onChange={({ target }) => {
            setMoniker(target.value);
            setMonikerError("");
          }}
          error={monikerError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Details"
          name="details"
          value={details}
          onChange={({ target }) => {
            setDetails(target.value);
            setDetailsError("");
          }}
          error={detailsError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Website"
          name="website"
          value={website}
          onChange={({ target }) => {
            setWebsite(target.value);
            setWebsiteError("");
          }}
          error={websiteError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Security Contact"
          name="security-contact"
          value={securityContact}
          onChange={({ target }) => {
            setSecurityContact(target.value);
            setSecurityContactError("");
          }}
          error={securityContactError}
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

export default MsgCreateValidatorForm;