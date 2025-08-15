/* eslint-disable @typescript-eslint/naming-convention */
// Gravity support is not available in cosmjs-types v0.9.0
// import {
//   QueryClientImpl,
//   QueryDenomToERC20Response,
//   QueryERC20ToDenomResponse,
//   QueryParamsResponse,
//   QueryPendingIbcAutoForwardsResponse,
//   QueryPendingSendToEvmChainResponse,
// } from "cosmjs-types/gravity/v1/query";

import { createProtobufRpcClient, QueryClient } from "../../queryclient";

// Dummy response types for interface compatibility
interface DummyQueryParamsResponse {
  params?: any;
}

interface DummyQueryERC20ToDenomResponse {
  denom?: string;
  cosmosOriginated?: boolean;
}

interface DummyQueryDenomToERC20Response {
  erc20?: string;
  cosmosOriginated?: boolean;
}

interface DummyQueryPendingSendToEvmChainResponse {
  transfersInBatches?: any[];
  unbatchedTransfers?: any[];
}

interface DummyQueryPendingIbcAutoForwardsResponse {
  pendingIbcAutoForwards?: any[];
}

export interface GravityExtension {
  readonly gravity: {
    readonly params: () => Promise<DummyQueryParamsResponse>;
    readonly erc20ToDenom: (chainName: string, erc20: string) => Promise<DummyQueryERC20ToDenomResponse>;
    readonly denomToErc20: (chainName: string, denom: string) => Promise<DummyQueryDenomToERC20Response>;
    readonly pendingSendToEvmChain: (
      chainName: string,
      sender: string,
    ) => Promise<DummyQueryPendingSendToEvmChainResponse>;
    readonly pendingIbcAutoForwards: (
      chainName: string,
      limit: bigint,
    ) => Promise<DummyQueryPendingIbcAutoForwardsResponse>;
  };
}

export function setupGravityExtension(base: QueryClient): GravityExtension {
  // Return dummy implementation since gravity module is not available
  return {
    gravity: {
      params: async () => {
        throw new Error("Gravity module is not available in cosmjs-types v0.9.0");
      },
      erc20ToDenom: async (chainName: string, erc20: string) => {
        throw new Error("Gravity module is not available in cosmjs-types v0.9.0");
      },
      denomToErc20: async (chainName: string, denom: string) => {
        throw new Error("Gravity module is not available in cosmjs-types v0.9.0");
      },
      pendingSendToEvmChain: async (chainName: string, sender: string) => {
        throw new Error("Gravity module is not available in cosmjs-types v0.9.0");
      },
      pendingIbcAutoForwards: async (chainName: string, limit: bigint) => {
        throw new Error("Gravity module is not available in cosmjs-types v0.9.0");
      },
    },
  };
}