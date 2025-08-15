/* eslint-disable @typescript-eslint/naming-convention */
import { AminoMsg, Coin } from "@/lib/packages/amino";
// Gravity support is not available in cosmjs-types v0.9.0
// import { MsgCancelSendToEvmChain, MsgSendToEvmChain } from "cosmjs-types/gravity/v1/msgs";

// eslint-disable-next-line import/no-cycle
import { AminoConverters } from "../../aminotypes";

// Gravity module is not available in cosmjs-types v0.9.0
// Dummy implementations to maintain interface compatibility

export interface AminoMsgSendToEvmChain extends AminoMsg {
  readonly type: "gravity/MsgSendToEvmChain";
  readonly value: {
    readonly sender: string;
    readonly eth_dest: string;
    readonly amount: Coin;
    readonly bridge_fee: Coin;
  };
}

export function isAminoMsgSendToEvmChain(msg: AminoMsg): msg is AminoMsgSendToEvmChain {
  return msg.type === "gravity/MsgSendToEvmChain";
}

export interface AminoMsgCancelSendToEvmChain extends AminoMsg {
  readonly type: "gravity/MsgCancelSendToEvmChain";
  readonly value: {
    readonly transaction_id: string;
    readonly sender: string;
  };
}

export function isAminoMsgCancelSendToEvmChain(msg: AminoMsg): msg is AminoMsgCancelSendToEvmChain {
  return msg.type === "gravity/MsgCancelSendToEvmChain";
}

export function createGravityAminoConverters(): AminoConverters {
  // Return empty converters since gravity module is not available
  return {};
}