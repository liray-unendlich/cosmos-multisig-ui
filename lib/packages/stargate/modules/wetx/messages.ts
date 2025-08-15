import { EncodeObject, GeneratedType, Registry } from "@/lib/packages/proto-signing";
import { FeeMarketEIP1559TxData } from "@ethereumjs/tx";

// WETX types are not available in cosmjs-types v0.9.0
export const wetxTypes: ReadonlyArray<[string, GeneratedType]> = [];

export interface MsgWrappedEthereumTxEncodeObject extends EncodeObject {
  readonly typeUrl: "/aioz.wetx.v1.MsgWrappedEthereumTx";
  readonly value: any;
}

export function isMsgWrappedEthereumTxEncodeObject(
  encodeObject: EncodeObject,
): encodeObject is MsgWrappedEthereumTxEncodeObject {
  return (
    (encodeObject as MsgWrappedEthereumTxEncodeObject).typeUrl ===
    "/aioz.wetx.v1.MsgWrappedEthereumTx"
  );
}

export interface ExtensionOptionsWrappedEthereumTxEncodeObject extends EncodeObject {
  readonly typeUrl: "/aioz.wetx.v1.ExtensionOptionsWrappedEthereumTx";
  readonly value: any;
}

export function isExtensionOptionsWrappedEthereumTxEncodeObject(
  encodeObject: EncodeObject,
): encodeObject is ExtensionOptionsWrappedEthereumTxEncodeObject {
  return (
    (encodeObject as ExtensionOptionsWrappedEthereumTxEncodeObject).typeUrl ===
    "/aioz.wetx.v1.ExtensionOptionsWrappedEthereumTx"
  );
}

export function createMsgWrappedEthereumTxEncodeObjectFromTxData(
  registry: Registry,
  from: string,
  txData: FeeMarketEIP1559TxData,
): MsgWrappedEthereumTxEncodeObject {
  throw new Error("WETX module is not available in cosmjs-types v0.9.0");
}