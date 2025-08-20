import { AminoConverters } from "../../aminotypes";
import { toBase64, fromBase64 } from "@/lib/packages/encoding";

export function createAuthzAminoConverters(): AminoConverters {
  return {
    "/cosmos.authz.v1beta1.MsgGrant": {
      aminoType: "cosmos-sdk/MsgGrant",
      toAmino: (value: any) => {
        return {
          granter: value.granter,
          grantee: value.grantee,
          grant: {
            authorization: value.grant?.authorization ? {
              "@type": value.grant.authorization.typeUrl,
              value: toBase64(value.grant.authorization.value),
            } : undefined,
            expiration: value.grant?.expiration,
          },
        };
      },
      fromAmino: (value: any) => {
        return {
          granter: value.granter,
          grantee: value.grantee,
          grant: {
            authorization: value.grant?.authorization ? {
              typeUrl: value.grant.authorization["@type"],
              value: fromBase64(value.grant.authorization.value),
            } : undefined,
            expiration: value.grant?.expiration,
          },
        };
      },
    },
    "/cosmos.authz.v1beta1.MsgRevoke": {
      aminoType: "cosmos-sdk/MsgRevoke",
      toAmino: (value: any) => {
        return {
          granter: value.granter,
          grantee: value.grantee,
          msg_type_url: value.msgTypeUrl,
        };
      },
      fromAmino: (value: any) => {
        return {
          granter: value.granter,
          grantee: value.grantee,
          msgTypeUrl: value.msg_type_url,
        };
      },
    },
    "/cosmos.authz.v1beta1.MsgExec": {
      aminoType: "cosmos-sdk/MsgExec",
      toAmino: (value: any) => {
        return {
          grantee: value.grantee,
          msgs: value.msgs?.map((msg: any) => ({
            "@type": msg.typeUrl,
            value: toBase64(msg.value),
          })) || [],
        };
      },
      fromAmino: (value: any) => {
        return {
          grantee: value.grantee,
          msgs: value.msgs?.map((msg: any) => ({
            typeUrl: msg["@type"],
            value: fromBase64(msg.value),
          })) || [],
        };
      },
    },
  };
}
