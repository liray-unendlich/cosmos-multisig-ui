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
    
    // Use standard secp256k1 signature encoding for consistency with multisig creation
    // This ensures the pubkey type matches what was used during multisig creation
    const signatureResult = encodeSecp256k1Signature(accountForAddress.pubkey, signature);
    
    // Debug information - use multiple output methods for visibility
    const debugInfo = {
      signerAddress,
      pubkeyHex: Array.from(accountForAddress.pubkey).map(b => b.toString(16).padStart(2, '0')).join(''),
      pubkeyResult: signatureResult.pub_key,
      pubkeyType: signatureResult.pub_key.type,
      signatureLength: signature.length,
      keyAlgo: this.keyAlgo,
      timestamp: new Date().toISOString()
    };
    
    // Output to console (may not work in production)
    console.log("=== Ledger署名情報 ===", debugInfo);
    
    // Output to localStorage for inspection
    try {
      localStorage.setItem('ledger_debug_info', JSON.stringify(debugInfo, null, 2));
    } catch (e) {
      // localStorage may not be available
    }
    
    // Output to alert for immediate visibility (uncomment if needed)
    // alert(`Ledger署名 - pubkeyタイプ: ${signatureResult.pub_key.type}`);
    
    return {
      signed: signDoc,
      signature: signatureResult,
    };
  }
}

