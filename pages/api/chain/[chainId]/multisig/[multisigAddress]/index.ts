import type { NextApiRequest, NextApiResponse } from "next";
import { getMultisig } from "../../../../../../lib/graphqlHelpers";

export default async function multisigAddressApi(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case "GET":
      try {
        const multisigAddress = req.query.multisigAddress?.toString() || "";
        const chainId = req.query.chainId?.toString() || "";
        console.log("Function `getMultisig` invoked", multisigAddress, chainId);
        const getRes = await getMultisig(multisigAddress, chainId);
        if (!getRes.data.getMultisig) {
          res.status(404).send("Multisig not found");
          return;
        }
        console.log("getRes", JSON.stringify(getRes, null, 2));
        console.log("success", getRes.data.getMultisig);
        res.status(200).send(getRes.data.getMultisig);
        return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.log(err);
        res.status(400).send(err.message);
        return;
      }
  }
  // no route matched
  res.status(405).end();
  return;
}
