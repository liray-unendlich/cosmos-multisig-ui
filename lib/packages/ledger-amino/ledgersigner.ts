import {
  AccountData,
  AminoSignResponse,
  encodeSecp256k1Signature,
  encodeEthSecp256k1Signature,
  makeCosmoshubPath,
  OfflineAminoSigner,
  serializeSignDoc,
  StdSignDoc,
} from "@/lib/packages/amino";
import { HdPath } from "@/lib/packages/crypto";
import Transport from "@ledgerhq/hw-transport";

import { AddressAndPubkey, LedgerConnector, LedgerConnectorOptions } from "./ledgerconnector";

export class LedgerSigner implements OfflineAminoSigner {
  private readonly connector: LedgerConnector;
  private readonly hdPaths: readonly HdPath[];
  private accounts?: readonly AccountData[];
  private readonly keyAlgo: "secp256k1" | "eth_secp256k1";

  public constructor(transport: Transport, options: LedgerConnectorOptions & { keyAlgo?: "secp256k1" | "eth_secp256k1" } = {}) {
    this.hdPaths = options.hdPaths || [makeCosmoshubPath(0)];
    this.connector = new LedgerConnector(transport, options);
    // Default to secp256k1, but allow eth_secp256k1 for chains like Sei
    this.keyAlgo = options.keyAlgo || "secp256k1";
  }

  public async getAccounts(): Promise<readonly AccountData[]> {
    if (!this.accounts) {
      const pubkeys = await this.connector.getPubkeys();
      this.accounts = await Promise.all(
        pubkeys.map(async (pubkey) => ({
          algo: this.keyAlgo,
          address: await this.connector.getCosmosAddress(pubkey),
          addressHex: await this.connector.getHexAddress(pubkey),
          pubkey: pubkey,
        })),
      );
    }

    return this.accounts;
  }

  /**
   * Shows the user's address in the device and returns an address/pubkey pair.
   *
   * The address will be shown with the native prefix of the app (e.g. cosmos, persistence, desmos)
   * and does not support the usage of other address prefixes.
   *
   * @param path The HD path to show the address for. If unset, this is the first account.
   */
  public async showAddress(path?: HdPath): Promise<AddressAndPubkey> {
    return this.connector.showAddress(path);
  }

  public async signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse> {
    const accounts = this.accounts || (await this.getAccounts());
    const accountIndex = accounts.findIndex((account) => account.address === signerAddress);

    if (accountIndex === -1) {
      throw new Error(`Address ${signerAddress} not found in wallet`);
    }

    const message = serializeSignDoc(signDoc);
    const accountForAddress = accounts[accountIndex];
    const hdPath = this.hdPaths[accountIndex];
    const signature = await this.connector.sign(message, hdPath);
    
    // Use the appropriate signature encoding based on the key algorithm
    if (this.keyAlgo === "eth_secp256k1") {
      // For EthSecp256k1, we need to add a recovery byte to make it 65 bytes
      // Ledger returns 64 bytes (r + s), we need to append recovery byte (v)
      // For Cosmos chains, the recovery byte is typically 0x00
      const signatureWithRecovery = new Uint8Array(65);
      signatureWithRecovery.set(signature, 0); // Copy the 64-byte signature
      signatureWithRecovery[64] = 0x00; // Add recovery byte at the end
      
      return {
        signed: signDoc,
        signature: encodeEthSecp256k1Signature(accountForAddress.pubkey, signatureWithRecovery),
      };
    } else {
      return {
        signed: signDoc,
        signature: encodeSecp256k1Signature(accountForAddress.pubkey, signature),
      };
    }
  }
}

