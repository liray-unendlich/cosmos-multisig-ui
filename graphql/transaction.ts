import { runCypher } from "@/lib/neo4j";
import { StdFee } from "@cosmjs/amino";
import { EncodeObject } from "@cosmjs/proto-signing";
import { randomUUID } from "crypto";
import { z } from "zod";
import { DbMultisig, DbMultisigId, DbSignatureObj } from ".";

export const DbTransaction = z.object({
  id: z.string(),
  txHash: z.string().nullish(),
  creator: z.lazy(() => DbMultisig.nullish()),
  // When parsed with JSON.parse it's DbTransactionParsedDataJson
  dataJSON: z.string(),
  signatures: z.lazy(() => z.array(DbSignatureObj)),
});
export type DbTransaction = Readonly<z.infer<typeof DbTransaction>>;

export interface DbTransactionParsedDataJson {
  readonly accountNumber: number;
  readonly sequence: number;
  readonly chainId: string;
  readonly msgs: EncodeObject[];
  readonly fee: StdFee;
  readonly memo: string;
}

export type DbTransactionDraft = Pick<DbTransaction, "dataJSON"> & { creator: DbMultisigId };

export const DbTransactionId = DbTransaction.pick({ id: true });
export type DbTransactionId = Readonly<z.infer<typeof DbTransactionId>>;

type Neo4jRecord = Awaited<ReturnType<typeof runCypher>>["records"][number];

const mapRecordToTransaction = (record: Neo4jRecord): DbTransaction => {
  const transaction = record.get("transaction");
  DbTransaction.parse(transaction);
  return transaction;
};

export const getTransaction = async (id: string): Promise<DbTransaction | null> => {
  const result = await runCypher(
    `
      MATCH (tx:Transaction { id: $id })
      OPTIONAL MATCH (m:Multisig)-[:CREATED_TRANSACTION]->(tx)
      OPTIONAL MATCH (tx)<-[:FOR_TRANSACTION]-(sig:Signature)
      WITH tx, m, collect(sig) AS signatureNodes
      RETURN {
        id: tx.id,
        txHash: tx.txHash,
        dataJSON: tx.dataJSON,
        creator: CASE
          WHEN m IS NULL THEN NULL
          ELSE m {
            .id,
            .chainId,
            .address,
            .pubkeyJSON,
            .creator
          }
        END,
        signatures: [s IN signatureNodes WHERE s IS NOT NULL |
          {
            bodyBytes: s.bodyBytes,
            signature: s.signature,
            address: s.address
          }
        ]
      } AS transaction
      LIMIT 1
    `,
    { id },
    "READ",
  );

  if (!result.records.length) {
    return null;
  }

  return mapRecordToTransaction(result.records[0]);
};

export const getTransactions = async (creatorId: string): Promise<readonly DbTransaction[]> => {
  const result = await runCypher(
    `
      MATCH (m:Multisig { id: $creatorId })-[:CREATED_TRANSACTION]->(tx:Transaction)
      OPTIONAL MATCH (tx)<-[:FOR_TRANSACTION]-(sig:Signature)
      WITH tx, m, collect(sig) AS signatureNodes
      ORDER BY tx.createdAt DESC
      RETURN {
        id: tx.id,
        txHash: tx.txHash,
        dataJSON: tx.dataJSON,
        creator: m {
          .id,
          .chainId,
          .address,
          .pubkeyJSON,
          .creator
        },
        signatures: [s IN signatureNodes WHERE s IS NOT NULL |
          {
            bodyBytes: s.bodyBytes,
            signature: s.signature,
            address: s.address
          }
        ]
      } AS transaction
    `,
    { creatorId },
    "READ",
  );

  return result.records.map(mapRecordToTransaction);
};

export const createTransaction = async (transaction: DbTransactionDraft) => {
  const result = await runCypher(
    `
      MATCH (m:Multisig { id: $creatorId })
      CREATE (
        tx:Transaction {
          id: $id,
          dataJSON: $dataJSON,
          txHash: NULL,
          createdAt: $createdAt
        }
      )
      MERGE (m)-[:CREATED_TRANSACTION]->(tx)
      RETURN tx { .id } AS transaction
    `,
    {
      id: randomUUID(),
      creatorId: transaction.creator.id,
      dataJSON: transaction.dataJSON ?? "",
      createdAt: new Date().toISOString(),
    },
  );

  const createdTx = result.records[0]?.get("transaction");

  if (!createdTx) {
    throw new Error("Failed to persist transaction in Neo4j");
  }

  const parsed = DbTransactionId.parse(createdTx);

  return parsed.id;
};

const DbTransactionTxHash = z.object({ txHash: z.string() });
type DbTransactionTxHash = Readonly<z.infer<typeof DbTransactionTxHash>>;

export const updateTxHash = async (id: string, txHash: string) => {
  const result = await runCypher(
    `
      MATCH (tx:Transaction { id: $id })
      SET tx.txHash = $txHash, tx.updatedAt = $updatedAt
      RETURN tx { .txHash } AS transaction
    `,
    { id, txHash, updatedAt: new Date().toISOString() },
  );

  const updatedTx = result.records[0]?.get("transaction");

  if (!updatedTx) {
    throw new Error("Failed to update transaction hash in Neo4j");
  }

  const parsed = DbTransactionTxHash.parse(updatedTx);

  return parsed.txHash;
};
