import {
  isJsonRpcErrorResponse,
  JsonRpcRequest,
  JsonRpcSuccessResponse,
  parseJsonRpcResponse,
} from "@/lib/packages/json-rpc";

import { http } from "./http";
import { hasProtocol, RpcClient } from "./rpcclient";

export interface HttpEndpoint {
  /**
   * The URL of the HTTP endpoint.
   *
   * For POST APIs like Tendermint RPC in CosmJS,
   * this is without the method specific paths (e.g. https://cosmoshub-4--rpc--full.datahub.figment.io/)
   */
  readonly url: string;
  /**
   * HTTP headers that are sent with every request, such as authorization information.
   */
  readonly headers: Record<string, string>;
}

export class HttpClient implements RpcClient {
  protected readonly url: string;
  protected readonly headers: Record<string, string> | undefined;

  public constructor(endpoint: string | HttpEndpoint) {
    if (typeof endpoint === "string") {
      // accept host.name:port and assume http protocol
      this.url = hasProtocol(endpoint) ? endpoint : "http://" + endpoint;
    } else {
      this.url = endpoint.url;
      this.headers = endpoint.headers;
    }
    
    // Validate URL is not empty
    if (!this.url || this.url.trim() === "") {
      throw new Error("RPC endpoint URL cannot be empty");
    }
    
    // Debug log for connection URL
    console.log("HttpClient connecting to:", this.url);
  }

  public disconnect(): void {
    // nothing to be done
  }

  public async execute(request: JsonRpcRequest): Promise<JsonRpcSuccessResponse> {
    // For debugging: log the request details
    console.log("HttpClient.execute - URL:", this.url, "Method:", request.method);
    
    // Try the URL as-is first, don't automatically append /
    // Some RPC endpoints might have specific paths or query parameters
    try {
      const response = parseJsonRpcResponse(await http("POST", this.url, this.headers, request));
      if (isJsonRpcErrorResponse(response)) {
        throw new Error(JSON.stringify(response.error));
      }
      return response;
    } catch (error: any) {
      // If we get a 405 and the URL doesn't end with /, try adding it
      if (error.message && error.message.includes("405") && !this.url.endsWith("/")) {
        console.log("Got 405 error, retrying with trailing slash");
        const urlWithSlash = `${this.url}/`;
        const response = parseJsonRpcResponse(await http("POST", urlWithSlash, this.headers, request));
        if (isJsonRpcErrorResponse(response)) {
          throw new Error(JSON.stringify(response.error));
        }
        return response;
      }
      // Re-throw the original error
      throw error;
    }
  }
}
