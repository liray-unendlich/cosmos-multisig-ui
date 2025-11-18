import { runCypher } from "@/lib/neo4j";
import { randomUUID } from "crypto";
import { z } from "zod";

const DbNonceObjNonce = z.object({ nonce: z.number() });
type DbNonceObjNonce = Readonly<z.infer<typeof DbNonceObjNonce>>;

export const getNonce = async (chainId: string, address: string) => {
  const result = await runCypher(
    `
      MERGE (n:Nonce { chainId: $chainId, address: $address })
      ON CREATE SET
        n.id = $id,
        n.nonce = 1,
        n.createdAt = $createdAt
      RETURN n.nonce AS nonce
    `,
    { chainId, address, id: randomUUID(), createdAt: new Date().toISOString() },
  );

  const nonceObj: DbNonceObjNonce = DbNonceObjNonce.parse({
    nonce: Number(result.records[0]?.get("nonce") ?? 1),
  });

  return nonceObj.nonce;
};

export const incrementNonce = async (chainId: string, address: string) => {
  const dbNonce = await getNonce(chainId, address);

  const result = await runCypher(
    `
      MATCH (n:Nonce { chainId: $chainId, address: $address })
      SET n.nonce = $nonce, n.updatedAt = $updatedAt
      RETURN n.nonce AS nonce
    `,
    { chainId, address, nonce: dbNonce + 1, updatedAt: new Date().toISOString() },
  );

  const updatedNonceObj: DbNonceObjNonce = DbNonceObjNonce.parse({
    nonce: Number(result.records[0]?.get("nonce") ?? dbNonce + 1),
  });

  return updatedNonceObj.nonce;
};
