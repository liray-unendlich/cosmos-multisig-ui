import { GeneratedType } from "@/lib/packages/proto-signing";
import { MsgExec, MsgGrant, MsgRevoke } from "cosmjs-types/cosmos/authz/v1beta1/tx";

export const authzTypes: ReadonlyArray<[string, GeneratedType]> = [
  ["/cosmos.authz.v1beta1.MsgExec", MsgExec as unknown as GeneratedType],
  ["/cosmos.authz.v1beta1.MsgGrant", MsgGrant as unknown as GeneratedType],
  ["/cosmos.authz.v1beta1.MsgRevoke", MsgRevoke as unknown as GeneratedType],
];
