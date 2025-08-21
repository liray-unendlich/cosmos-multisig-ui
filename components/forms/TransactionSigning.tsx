import { LoadingStates, SigningStatus } from "@/types/signing";
import { MultisigThresholdPubkey, makeCosmoshubPath } from "@/lib/packages/amino";
import { toBase64 } from "@/lib/packages/encoding";
import { LedgerSigner } from "@/lib/packages/ledger-amino";
import { Registry } from "@/lib/packages/proto-signing";
import {
  AminoTypes,
  SigningStargateClient,
  createSdkStakingAminoConverters,
  createBankAminoConverters,
  createAuthzAminoConverters,
  createDistributionAminoConverters,
  createGovAminoConverters,
  createSlashingAminoConverters,
  createIbcAminoConverters,
  createFeegrantAminoConverters,
  createVestingAminoConverters,
  defaultRegistryTypes,
  ibcTypes,
  feegrantTypes,
  vestingTypes,
  authzTypes,
} from "@/lib/packages/stargate";
// import { createDefaultAminoConverters } from "@cosmjs/stargate";
import {
  createWasmAminoConverters,
} from "@/lib/packages/cosmwasm-stargate";
import { assert } from "@/lib/packages/utils";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { useCallback, useLayoutEffect, useState } from "react";
import { useChains } from "../../context/ChainsContext";
import { getConnectError } from "../../lib/errorHelpers";
import { requestJson } from "../../lib/request";
import { DbSignature, DbTransaction, WalletAccount } from "../../types";
import HashView from "../dataViews/HashView";
import Button from "../inputs/Button";
import StackableContainer from "../layout/StackableContainer";

interface TransactionSigningProps {
  readonly signatures: DbSignature[];
  readonly tx: DbTransaction;
  readonly pubkey: MultisigThresholdPubkey;
  readonly transactionID: string;
  readonly addSignature: (signature: DbSignature) => void;
}

const TransactionSigning = (props: TransactionSigningProps) => {
  const memberPubkeys = props.pubkey.value.pubkeys.map(({ value }) => value);

  const { chain } = useChains();
  const [walletAccount, setWalletAccount] = useState<WalletAccount>();
  const [sigError, setSigError] = useState("");
  const [connectError, setConnectError] = useState("");
  const [signing, setSigning] = useState<SigningStatus>("not_signed");
  const [walletType, setWalletType] = useState<"Keplr" | "Ledger">();
  const [ledgerSigner, setLedgerSigner] = useState({});
  const [loading, setLoading] = useState<LoadingStates>({});

  const connectKeplr = useCallback(async () => {
    try {
      setLoading((oldLoading) => ({ ...oldLoading, keplr: true }));

      await window.keplr.enable(chain.chainId);
      window.keplr.defaultOptions = {
        sign: { preferNoSetFee: true, preferNoSetMemo: true, disableBalanceCheck: true },
      };
      const tempWalletAccount = await window.keplr.getKey(chain.chainId);
      setWalletAccount(tempWalletAccount);

      const pubkey = toBase64(tempWalletAccount.pubKey);
      // console.log("connectKeplr # 1", JSON.stringify({ tempWalletAccount, pubkey }, null, 2));

      const isMember = memberPubkeys.includes(pubkey);
      const hasSigned = isMember
        ? props.signatures.some((sig) => sig.address === tempWalletAccount.bech32Address)
        : false;
      if (!isMember) {
        setSigning("not_a_member");
      } else {
        if (hasSigned) {
          setSigning("signed");
        } else {
          setSigning("not_signed");
        }
      }

      setWalletType("Keplr");
      setConnectError("");
      setSigError(""); // Clear any previous signature errors
    } catch (e) {
      console.error(e);
      setConnectError(getConnectError(e));
    } finally {
      setLoading((newLoading) => ({ ...newLoading, keplr: false }));
    }
  }, [chain.chainId, memberPubkeys, props.signatures]);

  useLayoutEffect(() => {
    const accountChangeKey = "keplr_keystorechange";

    if (walletType === "Keplr") {
      window.addEventListener(accountChangeKey, connectKeplr);
    } else {
      window.removeEventListener(accountChangeKey, connectKeplr);
    }
  }, [connectKeplr, walletType]);

  const connectLedger = async () => {
    try {
      setLoading((newLoading) => ({ ...newLoading, ledger: true }));

      // Prepare ledger
      const ledgerTransport = await TransportWebUSB.create(120000, 120000);

      // For now, use standard secp256k1 for all chains
      // The EthSecp256k1 detection was causing issues with existing multisigs
      // that were created with standard secp256k1 keys
      // TODO: Properly detect based on actual pubkey types of multisig members
      const isEthSecp256k1Chain = false; // Disabled for now
      
      // Setup signer with the appropriate key algorithm
      const offlineSigner = new LedgerSigner(ledgerTransport, {
        hdPaths: [makeCosmoshubPath(0)],
        prefix: chain.addressPrefix,
        keyAlgo: isEthSecp256k1Chain ? "eth_secp256k1" : "secp256k1",
      });
      const accounts = await offlineSigner.getAccounts();
      const tempWalletAccount: WalletAccount = {
        bech32Address: accounts[0].address,
        pubKey: accounts[0].pubkey,
        algo: accounts[0].algo,
      };
      setWalletAccount(tempWalletAccount);

      const pubkey = toBase64(tempWalletAccount.pubKey);
      const isMember = memberPubkeys.includes(pubkey);
      const hasSigned = isMember
        ? props.signatures.some((sig) => sig.address === tempWalletAccount.bech32Address)
        : false;
      if (!isMember) {
        setSigning("not_a_member");
      } else {
        if (hasSigned) {
          setSigning("signed");
        } else {
          setSigning("not_signed");
        }
      }

      setLedgerSigner(offlineSigner);
      setWalletType("Ledger");
      setConnectError("");
      setSigError(""); // Clear any previous signature errors
    } catch (e) {
      console.error(e);
      setConnectError(getConnectError(e));
    } finally {
      setLoading((newLoading) => ({ ...newLoading, ledger: false }));
    }
  };

  const signTransaction = async () => {
    try {
      setLoading((newLoading) => ({ ...newLoading, signing: true }));
      setSigError(""); // Clear any previous errors before signing
      
      const offlineSigner =
        walletType === "Keplr" ? window.getOfflineSignerOnlyAmino(chain.chainId) : ledgerSigner;

      // For multisig transactions, we need to sign as the multisig address
      // but the signature is associated with the individual signer
      const multisigAddress = props.multisigAddress;
      const individualSignerAddress = walletAccount?.bech32Address;
      assert(individualSignerAddress, "Missing individual signer address");
      assert(multisigAddress, "Missing multisig address");
      
      // Debug information for Keplr/Ledger signing
      if (walletAccount) {
        const debugInfo = {
          walletType,
          individualSignerAddress,
          multisigAddress,
          pubkeyHex: Array.from(walletAccount.pubKey).map(b => b.toString(16).padStart(2, '0')).join(''),
          pubkeyBase64: toBase64(walletAccount.pubKey),
          chainId: chain.chainId,
          memberPubkeys: memberPubkeys,
          signerPubkey: toBase64(walletAccount.pubKey),
          isSignerMember: memberPubkeys.includes(toBase64(walletAccount.pubKey)),
          accountNumber: props.tx.accountNumber,
          sequence: props.tx.sequence,
          timestamp: new Date().toISOString()
        };
        
        console.log(`=== ${walletType}署名情報 ===`, debugInfo);
        try {
          localStorage.setItem(`${walletType.toLowerCase()}_debug_info`, JSON.stringify(debugInfo, null, 2));
        } catch (e) {
          // localStorage may not be available
        }
      }
      
      const signingClient = await SigningStargateClient.offline(offlineSigner, {
        registry: new Registry([
          ...defaultRegistryTypes, 
          // Add IBC, Feegrant, and Vesting message types
          ...ibcTypes,
          ...feegrantTypes,
          ...vestingTypes,
          ...authzTypes,
        ]),
        aminoTypes: new AminoTypes({
          ...createWasmAminoConverters(),
          ...createSdkStakingAminoConverters("cosmos"),
          ...createBankAminoConverters(),
          ...createGovAminoConverters(),
          ...createAuthzAminoConverters(),
          ...createSlashingAminoConverters(),
          ...createDistributionAminoConverters(),
          // Add IBC, Feegrant, and Vesting amino converters
          ...createIbcAminoConverters(),
          ...createFeegrantAminoConverters(),
          ...createVestingAminoConverters(),
        }),
      });

      // For multisig transactions, the signer address should be the multisig address
      // The account number and sequence should be from the multisig account
      const signerData = {
        accountNumber: props.tx.accountNumber,
        sequence: props.tx.sequence,
        chainId: chain.chainId,
      };
      
      // CRITICAL FIX: Use multisig address as signerAddress for multisig transactions
      const { bodyBytes, signatures } = await signingClient.sign(
        multisigAddress,  // ← Use multisig address instead of individual address
        props.tx.msgs,
        props.tx.fee,
        props.tx.memo,
        signerData,
      );

      // check existing signatures - compare both signature and address
      const bases64EncodedSignature = toBase64(signatures[0]);
      const bases64EncodedBodyBytes = toBase64(bodyBytes);
      
      // Check if this individual address has already signed (not just if signature matches)
      const hasAlreadySigned = props.signatures.some(
        (sig) => sig.address === individualSignerAddress
      );

      if (hasAlreadySigned) {
        setSigError("This account has already signed this transaction.");
        // Still mark as signed since the account has indeed signed
        setSigning("signed");
      } else {
        // Store the signature with the individual signer's address
        const signature = {
          bodyBytes: bases64EncodedBodyBytes,
          signature: bases64EncodedSignature,
          address: individualSignerAddress,  // ← Store with individual address
        };
        await requestJson(`/api/transaction/${props.transactionID}/signature`, { body: signature });
        props.addSignature(signature);
        setSigning("signed");
      }
    } catch (e) {
      console.error("signing transaction failed", e);
      setSigError(e.message || e);
    } finally {
      setLoading((newLoading) => ({ ...newLoading, signing: false }));
    }
  };;;;

  return (
    <>
      <StackableContainer lessPadding lessMargin lessRadius>
        <h2>Current Signers</h2>
        {props.signatures.length === 0 ? (
          <p>No signatures yet</p>
        ) : (
          props.signatures.map((signature, i) => (
            <StackableContainer lessPadding lessRadius lessMargin key={`${signature.address}_${i}`}>
              <HashView hash={signature.address} />
            </StackableContainer>
          ))
        )}
      </StackableContainer>
      <StackableContainer lessPadding lessMargin lessRadius>
        {signing === "signed" ? (
          <div className="confirmation">
            <svg viewBox="0 0 77 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 30L26 51L72 5" stroke="white" strokeWidth="12" />
            </svg>
            <p>You've signed this transaction</p>
          </div>
        ) : null}
        {signing === "not_a_member" ? (
          <div className="multisig-error">
            <p>You don't belong to this multisig</p>
          </div>
        ) : null}
        {signing === "not_signed" ? (
          <>
            {walletAccount ? (
              <>
                <p>
                  You can sign this transaction with {walletAccount.bech32Address} (
                  {walletType ?? "Unknown wallet type"})
                </p>
                <Button
                  label="Sign transaction"
                  onClick={signTransaction}
                  loading={loading.signing}
                />
              </>
            ) : (
              <>
                <h2>Choose wallet to sign</h2>
                <Button label="Connect Keplr" onClick={connectKeplr} loading={loading.keplr} />
                <Button
                  label="Connect Ledger (WebUSB)"
                  onClick={connectLedger}
                  loading={loading.ledger}
                />
              </>
            )}
          </>
        ) : null}
        {sigError ? (
          <StackableContainer lessPadding lessRadius lessMargin>
            <div className="signature-error">
              <p>{sigError}</p>
            </div>
          </StackableContainer>
        ) : null}
        {connectError ? (
          <StackableContainer lessPadding lessRadius lessMargin>
            <div className="signature-error">
              <p>{connectError}</p>
            </div>
          </StackableContainer>
        ) : null}
      </StackableContainer>
      <style jsx>{`
        p {
          text-align: center;
          max-width: none;
        }
        h2 {
          margin-top: 1em;
        }
        h2:first-child {
          margin-top: 0;
        }
        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .signature-error p {
          max-width: 550px;
          color: red;
          font-size: 16px;
          line-height: 1.4;
        }
        .signature-error p:first-child {
          margin-top: 0;
        }
        .confirmation {
          display: flex;
          justify-content: center;
        }
        .confirmation svg {
          height: 0.8em;
          margin-right: 0.5em;
        }
        .multisig-error p {
          color: red;
          font-size: 16px;
        }
      `}</style>
    </>
  );
};

export default TransactionSigning;