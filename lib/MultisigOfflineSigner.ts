import { AccountData, AminoSignResponse, OfflineAminoSigner, StdSignDoc } from "@/lib/packages/amino";

/**
 * Wraps an OfflineAminoSigner to handle multisig signing.
 * Maps multisig address to individual signer address for signing operations.
 */
export class MultisigOfflineSigner implements OfflineAminoSigner {
  constructor(
    private readonly baseSigner: OfflineAminoSigner,
    private readonly multisigAddress: string,
    private readonly individualAddress: string,
  ) {}

  async getAccounts(): Promise<readonly AccountData[]> {
    const accounts = await this.baseSigner.getAccounts();
    // Return the account that matches the individual address
    // but also include a "virtual" account for the multisig address
    const individualAccount = accounts.find(acc => acc.address === this.individualAddress);
    
    if (!individualAccount) {
      return accounts;
    }
    
    // Add a virtual account for the multisig address with the same pubkey
    // This allows SigningStargateClient to find the account when using multisig address
    const multisigAccount: AccountData = {
      ...individualAccount,
      address: this.multisigAddress,
    };
    
    return [...accounts, multisigAccount];
  }

  async signAmino(signerAddress: string, signDoc: StdSignDoc): Promise<AminoSignResponse> {
    // If signing with multisig address, route to individual address
    const actualSignerAddress = signerAddress === this.multisigAddress 
      ? this.individualAddress 
      : signerAddress;
    
    return this.baseSigner.signAmino(actualSignerAddress, signDoc);
  }
}