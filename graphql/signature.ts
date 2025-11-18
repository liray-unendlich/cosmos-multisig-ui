import { runCypher } from "@/lib/neo4j";
import { randomUUID } from "crypto";
import { z } from "zod";
import { DbTransactionId } from ".";

// Calling DbSignatureObj to avoid DbSignatureSignature for the field type
export const DbSignatureObj = z.object({
  bodyBytes: z.string(),
  signature: z.string(),
  address: z.string(),
});
export type DbSignatureObj = Readonly<z.infer<typeof DbSignatureObj>>;

export type DbSignatureObjDraft = DbSignatureObj & { readonly transaction: DbTransactionId };

const DbSignatureObjSignature = DbSignatureObj.pick({ signature: true });
type DbSignatureObjSignature = Readonly<z.infer<typeof DbSignatureObjSignature>>;

export const createSignature = async (signature: DbSignatureObjDraft) => {
  const result = await runCypher(
    `
      MATCH (tx:Transaction { id: $transactionId })
      MERGE (sig:Signature { transactionId: tx.id, address: $address })
      ON CREATE SET
        sig.id = $id,
        sig.bodyBytes = $bodyBytes,
        sig.signature = $signature,
        sig.createdAt = $createdAt
      ON MATCH SET
        sig.bodyBytes = $bodyBytes,
        sig.signature = $signature,
        sig.updatedAt = $createdAt
      MERGE (sig)-[:FOR_TRANSACTION]->(tx)
      RETURN sig { .signature } AS signature
    `,
    {
      transactionId: signature.transaction.id,
      bodyBytes: signature.bodyBytes,
      signature: signature.signature,
      address: signature.address,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    },
  );

  const signatureObjSignature = result.records[0]?.get("signature");

  if (!signatureObjSignature) {
    throw new Error("Failed to persist signature in Neo4j");
  }

  const parsed = DbSignatureObjSignature.parse(signatureObjSignature);

  return parsed.signature;
};
