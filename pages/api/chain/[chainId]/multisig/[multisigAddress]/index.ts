import type { NextApiRequest, NextApiResponse } from "next";
import { createMultisig, getMultisig } from "../../../../../../lib/graphqlHelpers";

export default async function multisigApi(req: NextApiRequest, res: NextApiResponse) {
  const { chainId, multisigAddress } = req.query;
  
  switch (req.method) {
    case "GET":
      try {
        console.log("Function `getMultisig` invoked", { chainId, multisigAddress });
        const multisig = await getMultisig(multisigAddress as string, chainId as string);
        if (!multisig) {
          res.status(404).send({ error: "Multisig not found" });
          return;
        }
        console.log("success", multisig);
        // Return the response in the format expected by GetMultisigAccountResponse
        res.status(200).send({ 
          pubkeyJSON: multisig.pubkeyJSON,
          address: multisig.address,
          chainId: multisig.chainId
        });
        return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.log(err);
        res.status(400).send({ error: err.message });
        return;
      }
    case "POST":
      try {
        const data = req.body;
        console.log("Function `createMultisig` invoked", data);
        const saveRes = await createMultisig(data);
        console.log("success", saveRes);
        res.status(200).send(saveRes.data.addMultisig.multisig[0]);
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
