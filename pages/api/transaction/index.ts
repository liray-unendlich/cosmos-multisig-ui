import { getMultisig } from "@/graphql/multisig";
import { createTransaction } from "@/graphql/transaction";
import { CreateDbTxBody } from "@/lib/api";
import type { NextApiRequest, NextApiResponse } from "next";

const endpointErrMsg = "Failed to create transaction";

export default async function apiCreateTransaction(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const body: CreateDbTxBody = req.body;
  
  // Debug logging
  console.log("=== Transaction Creation Debug ===");
  console.log("Request body:", JSON.stringify(body, null, 2));

  try {
    const multisig = await getMultisig(body.chainId, body.creator);
    if (!multisig) {
      throw new Error(`multisig not found with address ${body.creator} on chain ${body.chainId}`);
    }

    console.log("Found multisig:", JSON.stringify(multisig, null, 2));
    
    const transactionData = {
      dataJSON: JSON.stringify(body.dataJSON),
      creator: { id: multisig.id },
    };
    
    console.log("Sending to GraphQL:", JSON.stringify(transactionData, null, 2));

    const txId = await createTransaction(transactionData);

    res.status(200).send({ txId });
    console.log("Create transaction success", JSON.stringify({ txId }, null, 2));
  } catch (err: unknown) {
    console.error("Transaction creation error:", err);
    res
      .status(400)
      .send(err instanceof Error ? `${endpointErrMsg}: ${err.message}` : endpointErrMsg);
  }
}
