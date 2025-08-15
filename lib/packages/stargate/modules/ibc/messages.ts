import { EncodeObject, GeneratedType } from "@/lib/packages/proto-signing";
import { MsgTransfer } from "cosmjs-types/ibc/applications/transfer/v1/tx";
import {
  MsgAcknowledgement,
  MsgChannelCloseConfirm,
  MsgChannelCloseInit,
  MsgChannelOpenAck,
  MsgChannelOpenConfirm,
  MsgChannelOpenInit,
  MsgChannelOpenTry,
  MsgRecvPacket,
  MsgTimeout,
  MsgTimeoutOnClose,
} from "cosmjs-types/ibc/core/channel/v1/tx";
import {
  MsgCreateClient,
  MsgSubmitMisbehaviour,
  MsgUpdateClient,
  MsgUpgradeClient,
} from "cosmjs-types/ibc/core/client/v1/tx";
import {
  MsgConnectionOpenAck,
  MsgConnectionOpenConfirm,
  MsgConnectionOpenInit,
  MsgConnectionOpenTry,
} from "cosmjs-types/ibc/core/connection/v1/tx";

export const ibcTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/ibc.applications.transfer.v1.MsgTransfer", MsgTransfer as unknown as GeneratedType],
  ["/ibc.core.channel.v1.MsgAcknowledgement", MsgAcknowledgement as unknown as GeneratedType],
  ["/ibc.core.channel.v1.MsgChannelCloseConfirm", MsgChannelCloseConfirm as unknown as GeneratedType],
  ["/ibc.core.channel.v1.MsgChannelCloseInit", MsgChannelCloseInit as unknown as GeneratedType],
  ["/ibc.core.channel.v1.MsgChannelOpenAck", MsgChannelOpenAck as unknown as GeneratedType],
  ["/ibc.core.channel.v1.MsgChannelOpenConfirm", MsgChannelOpenConfirm as unknown as GeneratedType],
  ["/ibc.core.channel.v1.MsgChannelOpenInit", MsgChannelOpenInit as unknown as GeneratedType],
  ["/ibc.core.channel.v1.MsgChannelOpenTry", MsgChannelOpenTry as unknown as GeneratedType],
  ["/ibc.core.channel.v1.MsgRecvPacket", MsgRecvPacket as unknown as GeneratedType],
  ["/ibc.core.channel.v1.MsgTimeout", MsgTimeout as unknown as GeneratedType],
  ["/ibc.core.channel.v1.MsgTimeoutOnClose", MsgTimeoutOnClose as unknown as GeneratedType],
  ["/ibc.core.client.v1.MsgCreateClient", MsgCreateClient as unknown as GeneratedType],
  ["/ibc.core.client.v1.MsgSubmitMisbehaviour", MsgSubmitMisbehaviour as unknown as GeneratedType],
  ["/ibc.core.client.v1.MsgUpdateClient", MsgUpdateClient as unknown as GeneratedType],
  ["/ibc.core.client.v1.MsgUpgradeClient", MsgUpgradeClient as unknown as GeneratedType],
  ["/ibc.core.connection.v1.MsgConnectionOpenAck", MsgConnectionOpenAck as unknown as GeneratedType],
  ["/ibc.core.connection.v1.MsgConnectionOpenConfirm", MsgConnectionOpenConfirm as unknown as GeneratedType],
  ["/ibc.core.connection.v1.MsgConnectionOpenInit", MsgConnectionOpenInit as unknown as GeneratedType],
  ["/ibc.core.connection.v1.MsgConnectionOpenTry", MsgConnectionOpenTry as unknown as GeneratedType],
];

export interface MsgTransferEncodeObject extends EncodeObject {
  readonly typeUrl: "/ibc.applications.transfer.v1.MsgTransfer";
  readonly value: Partial<MsgTransfer>;
}

export function isMsgTransferEncodeObject(object: EncodeObject): object is MsgTransferEncodeObject {
  return (
    (object as MsgTransferEncodeObject).typeUrl === "/ibc.applications.transfer.v1.MsgTransfer"
  );
}
