import { hashBlock, hashTx } from "../hasher";
import { Params } from "./requests";
import { Responses } from "./responses";
import { Adaptor } from "./types";

export { type Decoder, type Encoder, type Params, type Responses } from "./types";

export const adaptor34: Adaptor = {
  params: Params,
  responses: Responses,
  hashTx: hashTx,
  hashBlock: hashBlock,
};
