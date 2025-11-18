import { ChainInfo } from "@/context/ChainsContext/types";
import { StdSignature, decodeSignature, pubkeyToAddress } from "@cosmjs/amino";
import { toBase64 } from "@cosmjs/encoding";
import { verifyADR36Amino } from "@keplr-wallet/cosmos";
import { StdSignDoc } from "@keplr-wallet/types";
import { useEffect } from "react";

const getKeplr = async (chainId: string) => {
  const keplr = window.keplr;
  if (!keplr) {
    throw new Error("Keplr not found");
  }

  await keplr.enable(chainId);

  keplr.defaultOptions = {
    sign: { preferNoSetFee: true, preferNoSetMemo: true, disableBalanceCheck: true },
  };

  return keplr;
};

export const getKeplrKey = async (chainId: string) => {
  const keplr = await getKeplr(chainId);
  const keplrKey = await keplr.getKey(chainId);

  return keplrKey;
};

export const getKeplrAminoSigner = async (chainId: string) => {
  await getKeplr(chainId);
  if (!window.keplr) {
    throw new Error("Keplr not found");
  }
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (window.keplr as any).getOfflineSignerOnlyAmino(chainId);
};

export const getKeplrVerifySignature = async (signer: string, chain: ChainInfo, nonce: number) => {
  const keplr = await getKeplr(chain.chainId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { signature } = await (keplr as any).signAmino(
    chain.chainId,
    signer,
    getKeplrVerifyMsg(signer, chain.chainDisplayName, nonce),
  );

  return signature;
};

const getKeplrVerifyMsg = (
  signer: string,
  chainDisplayName: string,
  nonce: number,
): StdSignDoc => ({
  chain_id: "",
  account_number: "0",
  sequence: "0",
  fee: { gas: "0", amount: [] },
  memo: "",
  msgs: [
    {
      type: "sign/MsgSignData",
      value: {
        signer,
        data: toBase64(new Uint8Array(Buffer.from(getKeplrVerifyData(chainDisplayName, nonce)))),
      },
    },
  ],
});

const getKeplrVerifyData = (chainDisplayName: string, nonce: number) =>
  JSON.stringify({
    title: `Keplr Login to ${chainDisplayName}`,
    description: "Sign this no fee transaction to login with your Keplr wallet",
    nonce,
  });

export const verifyKeplrSignature = (signature: StdSignature, chain: ChainInfo, nonce: number) => {
  const signer = pubkeyToAddress(signature.pub_key, chain.addressPrefix);
  const data = getKeplrVerifyData(chain.chainDisplayName, nonce);
  const { pubkey: decodedPubKey, signature: decodedSignature } = decodeSignature(signature);

  const verified = verifyADR36Amino(
    chain.addressPrefix,
    signer,
    data,
    decodedPubKey,
    decodedSignature,
  );

  return verified;
};

const accountChangeKey = "keplr_keystorechange";
export const useKeplrReconnect = (condition: boolean, connectWallet: () => Promise<void>) => {
  useEffect(() => {
    if (!condition) {
      return;
    }

    window.addEventListener(accountChangeKey, connectWallet);

    return () => {
      window.removeEventListener(accountChangeKey, connectWallet);
    };
  }, [condition, connectWallet]);
};
