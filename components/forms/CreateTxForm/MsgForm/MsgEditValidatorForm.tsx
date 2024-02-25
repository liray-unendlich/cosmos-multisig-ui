import { MsgEditValidatorEncodeObject } from "@cosmjs/stargate";
import { useEffect, useState } from "react";
import { MsgGetter } from "..";
import { useChains } from "../../../../context/ChainsContext";
import { trimStringsObj } from "../../../../lib/displayHelpers";
import { MsgCodecs, MsgTypeUrls } from "../../../../types/txMsg";
import Input from "../../../inputs/Input";
import StackableContainer from "../../../layout/StackableContainer";
import { toBech32, fromBech32} from "@cosmjs/encoding";

interface MsgEditValidatorFormProps {
  readonly delegatorAddress: string;
  readonly setMsgGetter: (msgGetter: MsgGetter) => void;
  readonly deleteMsg: () => void;
}

const MsgEditValidatorForm = ({
  delegatorAddress,
  setMsgGetter,
  deleteMsg,
}: MsgEditValidatorFormProps) => {
  const { chain } = useChains();

  const [commissionRate, setCommissionRate] = useState("");
  const [moniker, setMoniker] = useState("");
  const [details, setDetails] = useState("");
  const [website, setWebsite] = useState("");
  const [securityContact, setSecurityContact] = useState("");
  const [identity, setIdentity] = useState("");

  const [commissionRateError, setCommissionRateError] = useState("");
  const [monikerError, setMonikerError] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [websiteError, setWebsiteError] = useState("");
  const [securityContactError, setSecurityContactError] = useState("");
  const [identityError, setIdentityError] = useState("");

  const trimmedInputs = trimStringsObj({ moniker, identity, commissionRate, details, website, securityContact });
  
  const { data } = fromBech32(delegatorAddress);
  const valoperPrefix = chain.addressPrefix+'valoper';
  const valoperAddress = toBech32(valoperPrefix, data);

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    const { moniker, identity, commissionRate, details, website, securityContact } = trimmedInputs;

    const isMsgValid = (): boolean => {
      setCommissionRateError("");
      setMonikerError("");

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
        identity,
        website,
        securityContact,
        details,
      },
      commissionRate: commissionRate || undefined,
      validatorAddress: valoperAddress,
    });
    const msg: MsgEditValidatorEncodeObject  = { typeUrl: MsgTypeUrls.EditValidator, value: msgValue };

    setMsgGetter({ isMsgValid, msg });
  }, [
    chain,
    chain.addressPrefix,
    chain.assets,
    chain.chainId,
    chain.displayDenom,
    valoperAddress,
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
        validatorAddress: {valoperAddress}
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
          label="Identity"
          name="identity"
          value={identity}
          onChange={({ target }) => {
            setIdentity(target.value);
            setIdentityError("");
          }}
          error={identityError}
        />
      </div>
      <div className="form-item">
        <Input
          label="Commission Rate"
          name="commissionRate"
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
