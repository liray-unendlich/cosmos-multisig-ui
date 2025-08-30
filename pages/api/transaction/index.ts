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
  
  // Debug logging with version info
  console.log("=== Transaction Creation Debug v2.0 ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Request body:", JSON.stringify(body, null, 2));
  console.log("Body creator field:", body.creator);
  console.log("Body creator type:", typeof body.creator);

  try {
    const multisig = await getMultisig(body.chainId, body.creator);
    if (!multisig) {
      console.error(`Multisig lookup failed: chainId=${body.chainId}, creator=${body.creator}`);
      throw new Error(`multisig not found with address ${body.creator} on chain ${body.chainId}`);
    }

    console.log("Found multisig:", JSON.stringify(multisig, null, 2));
    
    const transactionData = {
      dataJSON: JSON.stringify(body.dataJSON),
      creator: { id: multisig.id },
    };
    
    console.log("Sending to GraphQL:", JSON.stringify(transactionData, null, 2));
    console.log("GraphQL creator object:", JSON.stringify(transactionData.creator, null, 2));

    const txId = await createTransaction(transactionData);

    res.status(200).send({ txId });
    console.log("Create transaction success", JSON.stringify({ txId }, null, 2));
  } catch (err: unknown) {
    console.error("Transaction creation error:", err);
    console.error("Error stack:", err instanceof Error ? err.stack : "No stack trace");
    res
      .status(400)
      .send(err instanceof Error ? `${endpointErrMsg}: ${err.message}` : endpointErrMsg);
  }
}
