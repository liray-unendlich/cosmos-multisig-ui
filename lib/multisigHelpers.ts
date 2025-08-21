import { checkAddress } from "./displayHelpers";
import {
  MultisigThresholdPubkey,
  createMultisigThresholdPubkey,
  isMultisigThresholdPubkey,
  pubkeyToAddress,
} from "./packages/amino";
import { Account, StargateClient } from "./packages/stargate";
import { assert } from "./packages/utils";
import { requestJson } from "./request";

interface CreateMultisigAccountResponse {
  readonly address: string;
}

/**
 * Turns array of compressed Secp256k1 pubkeys
 * into a multisig using comsjs
 *
 * @param {array} compressedPubkeys Must be an array of compressed Secp256k1 pubkeys (e.g 'A8B5KVhRz1oQuV1dguzFdGBhHrIU/I+R/QfBZcbZFWVG').
 * @param {number} threshold the number of signers required to sign messages from this multisig
 * @param {string} addressPrefix chain based prefix for the address (e.g. 'cosmos')
 * @param {string} chainId chain-id for the multisig (e.g. 'cosmoshub-4')
 * @return {string} The multisig address.
 */
const createMultisigFromCompressedSecp256k1Pubkeys = async (
  compressedPubkeys: string[],
  threshold: number,
  addressPrefix: string,
  chainId: string,
): Promise<string> => {
  // Validate input
  if (!compressedPubkeys || compressedPubkeys.length < 2) {
    throw new Error("At least 2 public keys are required for a multisig");
  }
  
  if (threshold < 1 || threshold > compressedPubkeys.length) {
    throw new Error(`Invalid threshold: ${threshold}. Must be between 1 and ${compressedPubkeys.length}`);
  }
  
  // Validate each pubkey
  const validPubkeys = compressedPubkeys.filter((pubkey) => {
    if (!pubkey || typeof pubkey !== 'string' || pubkey.length === 0) {
      console.warn("Skipping invalid pubkey:", pubkey);
      return false;
    }
    // Base64 encoded compressed secp256k1 pubkey should be 44 characters
    if (pubkey.length !== 44) {
      console.warn(`Skipping pubkey with invalid length (${pubkey.length}):`, pubkey);
      return false;
    }
    return true;
  });
  
  if (validPubkeys.length < 2) {
    throw new Error(`Not enough valid public keys. Found ${validPubkeys.length}, need at least 2`);
  }
  
  const pubkeys = validPubkeys.map((compressedPubkey, index) => {
    const pubkeyObj = {
      // Use standard secp256k1 for all chains (including Sei)
      // The ethermint type was causing issues with address generation
      type: "/cosmos.crypto.secp256k1.PubKey",
      // type: "/ethermint.crypto.v1.ethsecp256k1.PubKey",  // This causes et.match is not a function error
      // type: "tendermint/PubKeySecp256k1",
      value: compressedPubkey,
    };
    return pubkeyObj;
  });
  const multisigPubkey = createMultisigThresholdPubkey(pubkeys, threshold);
  const multisigAddress = pubkeyToAddress(multisigPubkey, addressPrefix);
  
  // Debug information with multiple output methods
  const debugInfo = {
    validPubkeyCount: validPubkeys.length,
    threshold,
    chainId,
    addressPrefix,
    pubkeyTypes: pubkeys.map(p => p.type),
    multisigAddress,
    multisigPubkeyType: multisigPubkey.type,
    timestamp: new Date().toISOString()
  };
  
  // Output to console (may not work in production)
  console.log("=== マルチシグ作成情報 ===", debugInfo);
  
  // Output to localStorage for inspection
  try {
    localStorage.setItem('multisig_debug_info', JSON.stringify(debugInfo, null, 2));
  } catch (e) {
    // localStorage may not be available
  }
  
  // save multisig to fauna
  const multisig = {
    address: multisigAddress,
    pubkeyJSON: JSON.stringify(multisigPubkey),
    chainId,
  };

  const resp: CreateMultisigAccountResponse = await requestJson(`/api/chain/${chainId}/multisig`, {
    body: multisig,
  });
  
  const { address } = resp;
  return address;
};;;

/**
 * デバッグ用: 同じ公開鍵から異なるタイプでアドレスを生成して比較する
 */
const debugPubkeyToAddress = (pubkeyValue: string, addressPrefix: string) => {
  console.log("=== アドレス生成比較 ===");
  console.log("公開鍵値:", pubkeyValue);
  console.log("アドレス接頭辞:", addressPrefix);
  
  // Standard secp256k1
  const secp256k1Pubkey = {
    type: "/cosmos.crypto.secp256k1.PubKey",
    value: pubkeyValue,
  };
  const secp256k1Address = pubkeyToAddress(secp256k1Pubkey, addressPrefix);
  console.log("Standard secp256k1 アドレス:", secp256k1Address);
  
  // Legacy Tendermint format
  const tendermintPubkey = {
    type: "tendermint/PubKeySecp256k1",
    value: pubkeyValue,
  };
  const tendermintAddress = pubkeyToAddress(tendermintPubkey, addressPrefix);
  console.log("Tendermint secp256k1 アドレス:", tendermintAddress);
  
  // EthSecp256k1 format
  const ethSecp256k1Pubkey = {
    type: "/ethermint.crypto.v1.ethsecp256k1.PubKey",
    value: pubkeyValue,
  };
  try {
    const ethSecp256k1Address = pubkeyToAddress(ethSecp256k1Pubkey, addressPrefix);
    console.log("EthSecp256k1 アドレス:", ethSecp256k1Address);
  } catch (error) {
    console.log("EthSecp256k1 アドレス生成エラー:", error.message);
  }
  
  return {
    secp256k1: secp256k1Address,
    tendermint: tendermintAddress,
    pubkeyValue,
  };
};

interface GetMultisigAccountResponse {
  readonly pubkeyJSON: string;
}

/**
 * This gets a multisigs account (pubkey, sequence, account number, etc) from
 * a node and/or the api if the multisig was made on this app.
 *
 * The public key should always be available, either on chain or in the app's database.
 * The account is only available when the there was any on-chain activity such as
 * receipt of tokens.
 */
const getMultisigAccount = async (
  address: string,
  addressPrefix: string,
  client: StargateClient,
): Promise<[MultisigThresholdPubkey, Account | null]> => {
  // console.log("getMultisigAccount # 1", JSON.stringify({ address, addressPrefix }, null, 2));
  // we need the multisig pubkeys to create transactions, if the multisig
  // is new, and has never submitted a transaction its pubkeys will not be
  // available from a node. If the multisig was created with this instance
  // of this tool its pubkey will be available in the relational offchain database
  const addressError = checkAddress(address, addressPrefix);
  if (addressError) {
    throw new Error(addressError);
  }

  const accountOnChain = await client.getAccount(address);
  // console.log("getMultisigAccount # 2", JSON.stringify({ accountOnChain }, null, 2));
  const chainId = await client.getChainId();

  let pubkey: MultisigThresholdPubkey;
  if (accountOnChain?.pubkey) {
    assert(
      isMultisigThresholdPubkey(accountOnChain.pubkey),
      "Pubkey on chain is not of type MultisigThreshold",
    );
    pubkey = accountOnChain.pubkey;
  } else {
    try {
      const resp: GetMultisigAccountResponse = await requestJson(
        `/api/chain/${chainId}/multisig/${address}`,
      );
      // console.log("getMultisigAccount # 3", JSON.stringify({ resp }, null, 2));
      const { pubkeyJSON } = resp;
      pubkey = JSON.parse(pubkeyJSON);
    } catch {
      throw new Error("Multisig has no pubkey on node, and was not created using this tool.");
    }
  }

  // console.log(
  //   "getMultisigAccount # 4: result",
  //   JSON.stringify({ pubkey, accountOnChain }, null, 2),
  // );

  return [pubkey, accountOnChain];
};

export { createMultisigFromCompressedSecp256k1Pubkeys, getMultisigAccount };
