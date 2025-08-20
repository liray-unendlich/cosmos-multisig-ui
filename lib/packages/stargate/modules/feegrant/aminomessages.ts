import { AminoConverters } from "../../aminotypes";
import { toBase64, fromBase64 } from "@/lib/packages/encoding";
import { MsgGrantAllowance, MsgRevokeAllowance } from "cosmjs-types/cosmos/feegrant/v1beta1/tx";

export function createFeegrantAminoConverters(): AminoConverters {
  return {
    "/cosmos.feegrant.v1beta1.MsgGrantAllowance": {
      aminoType: "cosmos-sdk/MsgGrantAllowance",
      toAmino: (value: MsgGrantAllowance) => {
        return {
          granter: value.granter,
          grantee: value.grantee,
          allowance: value.allowance ? {
            "@type": value.allowance.typeUrl,
            value: toBase64(value.allowance.value),
          } : undefined,
        };
      },
      fromAmino: (value: any) => {
        return {
          granter: value.granter,
          grantee: value.grantee,
          allowance: value.allowance ? {
            typeUrl: value.allowance["@type"],
            value: fromBase64(value.allowance.value),
          } : undefined,
        };
      },
    },
    "/cosmos.feegrant.v1beta1.MsgRevokeAllowance": {
      aminoType: "cosmos-sdk/MsgRevokeAllowance",
      toAmino: (value: MsgRevokeAllowance) => {
        return {
          granter: value.granter,
          grantee: value.grantee,
        };
      },
      fromAmino: (value: any) => {
        return {
          granter: value.granter,
          grantee: value.grantee,
        };
      },
    },
  };
}