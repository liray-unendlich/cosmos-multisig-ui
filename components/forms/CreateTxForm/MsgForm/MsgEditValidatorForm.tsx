import { MsgEditValidatorEncodeObject } from "@cosmjs/stargate";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { exampleValidatorAddress, trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";

interface MsgEditValidatorFormProps {
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgEditValidatorForm = ({
  setMsgGetter,
  deleteMsg,
}: MsgEditValidatorFormProps) => {
  const { chain } = useChains();

  const [validatorAddress, setValidatorAddress] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [moniker, setMoniker] = useState("");
  const [details, setDetails] = useState("");
  const [website, setWebsite] = useState("");
  const [securityContact, setSecurityContact] = useState("");

  const [validatorAddressError, setValidatorAddressError] = useState("");
  const [commissionRateError, setCommissionRateError] = useState("");
  const [monikerError, setMonikerError] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [websiteError, setWebsiteError] = useState("");
  const [securityContactError, setSecurityContactError] = useState("");

  const trimmedInputs = trimStringsObj({ commissionRate, moniker, details, website, securityContact });

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { commissionRate, moniker, details, website, securityContact } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setValidatorAddressError("");
      setCommissionRateError("");
      setMonikerError("");

      // validatorAddress validation it should be a valid bech32 address
      if (!validatorAddress || !validatorAddress.startsWith(chain.addressPrefix+"valoper")) {
        setValidatorAddressError("Validator Address must be a valid bech32 operator address");
        return false;
      }
      // commissionRate validation it should be greater than 0 and less than 1 and less than commissionMax
      if (Number(commissionRate) < 0 || Number(commissionRate) > 1 * 10**18) {
        setCommissionRateError("Commission Rate must be greater than 0 and less than 1 and less than Commission Max");
        return false;
      }

      // website validation it should be a valid url like "https://xx.com"
      if (website && (!website.startsWith("https://") || !website.startsWith("http://")) ) {
        setWebsiteError("Website must be a valid url like https://xx.com or http://xx.com");
        return false;
      }

      // securityContact validation it should be a valid email address
      if (securityContact && !securityContact.includes("@")) {
        setSecurityContactError("Security Contact must be a valid email address");
        return false;
      }

      return true;
    };

    const msgValue = MsgCodecs[MsgTypeUrls.EditValidator].fromPartial({
      description: {
        moniker,
        website,
        securityContact,
        details,
      },
      commissionRate: commissionRate || undefined,
      validatorAddress,
    });
    console.log("msgValue", msgValue);
    console.log(chain);
    const msg: MsgEditValidatorEncodeObject  = { typeUrl: MsgTypeUrls.EditValidator, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [
    chain,
    chain.addressPrefix,
    chain.assets,
    chain.chainId,
    chain.displayDenom,
    validatorAddress,
    setMsgGetter,
    trimmedInputs,
  ]);

  return (
    <StackableContainer lessPadding lessMargin>
      <button className="remove" onClick={() => deleteMsg()}>
        ✕
      </button>
      <h2>MsgEditValidator</h2>
      <div className="form-item">
        <Input
          label="Validator Operator Address"
          name="validator-pubkey"
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
          type="number"
          label={`Commission Rate`}
          name="commission-rate"
          onChange={({ target }) => {
            setCommissionRate((parseFloat(target.value)*10**18).toString());
            setCommissionRateError("");
          }}
          error={commissionRateError}
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

export default MsgEditValidatorForm;
