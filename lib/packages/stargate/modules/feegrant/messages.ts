import { GeneratedType } from "@/lib/packages/proto-signing";
import {
  MsgGrantAllowance,
  MsgRevokeAllowance,
} from "@/lib/packages/cosmjs-types/cosmos/feegrant/v1beta1/tx";

export const feegrantTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/cosmos.feegrant.v1beta1.MsgGrantAllowance", MsgGrantAllowance],
  ["/cosmos.feegrant.v1beta1.MsgRevokeAllowance", MsgRevokeAllowance],
];
