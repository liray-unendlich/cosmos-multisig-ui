import { Validator } from "cosmjs-types/cosmos/staking/v1beta1/staking";
import { QueryClient, SdkStakingExtension, setupSdkStakingExtension } from "./packages/stargate";
import { Tendermint34Client } from "./packages/tendermint-rpc";

const getValidatorsPage = (
  queryClient: QueryClient & SdkStakingExtension,
  paginationKey: Uint8Array | undefined,
) => queryClient.staking.validators("BOND_STATUS_BONDED", paginationKey);

export const getAllValidators = async (rpcUrl: string): Promise<readonly Validator[]> => {
  const validators: Validator[] = [];

  const cometClient = await Tendermint34Client.connect(rpcUrl);
  const queryClient = QueryClient.withExtensions(cometClient, setupSdkStakingExtension);

  let paginationKey: Uint8Array | undefined = undefined;

  do {
    const response = await getValidatorsPage(queryClient, paginationKey);
    validators.push(...response.validators);
    paginationKey = response.pagination?.nextKey;
  } while (paginationKey?.length);

  return validators;
};
