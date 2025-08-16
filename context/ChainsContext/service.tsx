import { getChainsFromRegistry, getShaFromRegistry } from "@/lib/chainRegistry";
import { StargateClient } from "@/lib/packages/stargate";
import { useEffect, useState } from "react";
import { emptyChain, isChainInfoFilled } from "./helpers";
import {
  getChainFromEnvfile,
  getChainFromStorage,
  getChainFromUrl,
  getChainsFromStorage,
  getRecentChainFromStorage,
  getShaFromStorage,
  setChainsInStorage,
  setShaInStorage,
} from "./storage";
import { ChainItems } from "./types";

export const useChainsFromRegistry = () => {
  const [chainItems, setChainItems] = useState<ChainItems>({
    mainnets: new Map(),
    testnets: new Map(),
    localnets: new Map(),
  });
  const [chainItemsError, setChainItemsError] = useState<string | null>(null);

  useEffect(() => {
    (async function () {
      if (chainItems.mainnets.size && chainItems.testnets.size) {
        return;
      }

      const storedChains = getChainsFromStorage();

      try {
        const storedSha = getShaFromStorage();
        const registrySha = await getShaFromRegistry();

        if (storedSha === registrySha && storedChains.mainnets.size && storedChains.testnets.size) {
          setChainItems(storedChains);
          return;
        }

        const registryChains = await getChainsFromRegistry();
        const chains: ChainItems = { ...storedChains, ...registryChains };

        setChainItems(chains);

        if (chains.mainnets.size && chains.testnets.size) {
          setChainsInStorage(chains);
          setShaInStorage(registrySha);
        } else {
          setShaInStorage("");
        }
      } catch (e) {
        if (storedChains.mainnets.size && storedChains.testnets.size) {
          setChainItems(storedChains);
          return;
        }

        if (e instanceof Error) {
          console.error(e.message);
          setChainItemsError(e.message);
        } else {
          setChainItemsError("Failed to get chains from registry");
        }
      }
    })();
  }, [chainItems.mainnets.size, chainItems.testnets.size]);

  return { chainItems, chainItemsError };
};

export const getNodeFromArray = async (nodeArray: readonly string[]) => {
  // Normalize URLs by removing default HTTPS port
  const normalizeUrl = (url: string): string => {
    // Remove :443 from HTTPS URLs as it's the default port
    if (url.startsWith("https://") && url.includes(":443")) {
      return url.replace(":443", "");
    }
    return url;
  };

  // only return https connections
  const secureNodes = nodeArray
    .filter((address) => address.startsWith("https://"))
    .map((address) => normalizeUrl(address));

  if (!secureNodes.length) {
    throw new Error("No SSL enabled RPC nodes available for this chain");
  }

  console.log("Testing RPC nodes:", secureNodes);
  const errors: { node: string; error: any }[] = [];

  for (const node of secureNodes) {
    try {
      console.log(`Testing node: ${node}`);
      // test client connection using HttpEndpoint to force HTTP connection
      // This prevents WebSocket connection attempts which fail in HTTPS environments
      const client = await StargateClient.connect({ url: node, headers: {} });
      const height = await client.getHeight();
      console.log(`Successfully connected to: ${node}, height: ${height}`);
      return node;
    } catch (error) {
      console.error(`Failed to connect to ${node}:`, error);
      errors.push({ node, error });
    }
  }

  // Provide detailed error information
  console.error("All RPC nodes failed. Details:", errors);
  throw new Error(`No RPC nodes available for this chain. Tested ${errors.length} nodes.`);
};

export const getChain = (chains: ChainItems) => {
  if (typeof window === "undefined") return emptyChain;

  const rootRoute = location.pathname.split("/")[1];
  // Avoid app from thinking the /api route is a registryName
  const chainNameFromUrl = rootRoute === "api" ? "" : rootRoute;

  const recentChain = getRecentChainFromStorage(chains);
  if (!chainNameFromUrl && isChainInfoFilled(recentChain)) {
    return recentChain;
  }

  const urlChain = getChainFromUrl(chainNameFromUrl);
  const envfileChain = getChainFromEnvfile(chainNameFromUrl);
  const storedChain = getChainFromStorage(
    chainNameFromUrl || envfileChain.registryName || "cosmoshub",
    chains,
  );

  const chain = { ...storedChain, ...envfileChain, ...urlChain };

  return isChainInfoFilled(chain) ? chain : emptyChain;
};
