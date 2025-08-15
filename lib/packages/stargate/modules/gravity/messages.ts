import { EncodeObject, GeneratedType } from "@/lib/packages/proto-signing";
// Gravity support is not available in cosmjs-types v0.9.0
// import { MsgCancelSendToEvmChain, MsgSendToEvmChain } from "cosmjs-types/gravity/v1/msgs";

export const gravityTypes: ReadonlyArray<[string, GeneratedType]> = [
  // Empty array since gravity module is not available in cosmjs-types v0.9.0
];

// Dummy type definitions for interface compatibility
interface DummyMsgSendToEvmChain {
  sender?: string;
  ethDest?: string;
  amount?: any;
  bridgeFee?: any;
}

interface DummyMsgCancelSendToEvmChain {
  transactionId?: string;
  sender?: string;
}

export interface MsgSendToEvmChainEncodeObject extends EncodeObject {
  readonly typeUrl: "/gravity.v1.MsgSendToEvmChain";
  readonly value: Partial<DummyMsgSendToEvmChain>;
}

export function isMsgSendToEvmChainEncodeObject(
  encodeObject: EncodeObject,
): encodeObject is MsgSendToEvmChainEncodeObject {
  return (
    (encodeObject as MsgSendToEvmChainEncodeObject).typeUrl === "/gravity.v1.MsgSendToEvmChain"
  );
}

export interface MsgCancelSendToEvmChainEncodeObject extends EncodeObject {
  readonly typeUrl: "/gravity.v1.MsgCancelSendToEvmChain";
  readonly value: Partial<DummyMsgCancelSendToEvmChain>;
}

export function isMsgCancelSendToEvmChainEncodeObject(
  encodeObject: EncodeObject,
): encodeObject is MsgCancelSendToEvmChainEncodeObject {
  return (
    (encodeObject as MsgCancelSendToEvmChainEncodeObject).typeUrl ===
    "/gravity.v1.MsgCancelSendToEvmChain"
  );
}