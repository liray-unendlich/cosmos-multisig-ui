/* eslint-disable @typescript-eslint/naming-convention */
import { createProtobufRpcClient, QueryClient } from "../../queryclient";

export interface StakingExtension {
  // Staking module is not available in cosmjs-types v0.9.0
}

export function setupStakingExtension(base: QueryClient): StakingExtension {
  throw new Error("Staking module is not available in cosmjs-types v0.9.0. Use SdkStakingExtension instead.");
}
