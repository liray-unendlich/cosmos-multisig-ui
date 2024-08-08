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
  // console.log(
  //   "=== createMultisigFromCompressedSecp256k1Pubkeys",
  //   JSON.stringify(
  //     {
  //       compressedPubkeys,
  //       threshold,
  //       addressPrefix,
  //       chainId,
  //     },
  //     null,
  //     2,
  //   ),
  // );
  const pubkeys = compressedPubkeys.map((compressedPubkey) => {
    return {
      type: "/ethermint.crypto.v1.ethsecp256k1.PubKey",
      // type: "/cosmos.crypto.secp256k1.PubKey",
      // type: "tendermint/PubKeySecp256k1",
      value: compressedPubkey,
    };
  });
  const multisigPubkey = createMultisigThresholdPubkey(pubkeys, threshold);
  // debugger;
  const multisigAddress = pubkeyToAddress(multisigPubkey, addressPrefix);
  // const multisigAddress = "haqq1jk7n65xev9ye7wljw95uhu2ghf4sgxf354s6p9";
  // console.log(
  //   "=== createMultisigFromCompressedSecp256k1Pubkeys2",
  //   JSON.stringify(
  //     {
  //       pubkeys,
  //       multisigPubkey,
  //       multisigAddress,
  //     },
  //     null,
  //     2,
  //   ),
  // );
  // save multisig to fauna
  const multisig = {
    address: multisigAddress,
    pubkeyJSON: JSON.stringify(multisigPubkey),
    chainId,
  };

  const resp: CreateMultisigAccountResponse = await requestJson(`/api/chain/${chainId}/multisig`, {
    body: multisig,
  });
  // console.log(
  //   "=== createMultisigFromCompressedSecp256k1Pubkeys3",
  //   JSON.stringify({ resp }, null, 2),
  // );
  const { address } = resp;

  return address;
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
