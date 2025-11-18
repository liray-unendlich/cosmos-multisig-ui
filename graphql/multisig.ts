import { runCypher } from "@/lib/neo4j";
import { randomUUID } from "crypto";
import { z } from "zod";

export const DbMultisig = z.object({
  id: z.string(),
  chainId: z.string(),
  address: z.string(),
  pubkeyJSON: z.string(),
  creator: z.string().nullish(),
});
export type DbMultisig = Readonly<z.infer<typeof DbMultisig>>;

export type DbMultisigDraft = Omit<DbMultisig, "id">;

export const DbMultisigId = DbMultisig.pick({ id: true });
export type DbMultisigId = Readonly<z.infer<typeof DbMultisigId>>;

type Neo4jRecord = Awaited<ReturnType<typeof runCypher>>["records"][number];

const mapRecordToMultisig = (record: Neo4jRecord): DbMultisig => {
  const multisig = record.get("multisig");
  DbMultisig.parse(multisig);
  return multisig;
};

export const getMultisig = async (
  chainId: string,
  multisigAddress: string,
): Promise<DbMultisig | null> => {
  const result = await runCypher(
    `
      MATCH (m:Multisig { chainId: $chainId, address: $multisigAddress })
      RETURN m {
        .id,
        .chainId,
        .address,
        .pubkeyJSON,
        .creator
      } AS multisig
      LIMIT 1
    `,
    { chainId, multisigAddress },
    "READ",
  );

  if (!result.records.length) {
    return null;
  }

  return mapRecordToMultisig(result.records[0]);
};

const getUniqueMultisigs = (
  multisigs: readonly DbMultisig[],
): readonly DbMultisig[] => {
  const uniqueMultisigs = new Map<string, DbMultisig>();

  for (const multisig of multisigs) {
    if (!uniqueMultisigs.has(multisig.address)) {
      uniqueMultisigs.set(multisig.address, multisig);
    }
  }

  return Array.from(uniqueMultisigs.values());
};

const DbMultisigs = z.array(DbMultisig);

export const getCreatedMultisigs = async (
  chainId: string,
  creatorAddress: string,
): Promise<readonly DbMultisig[]> => {
  const result = await runCypher(
    `
      MATCH (m:Multisig { chainId: $chainId })
      WHERE m.creator = $creatorAddress
      RETURN m {
        .id,
        .chainId,
        .address,
        .pubkeyJSON,
        .creator
      } AS multisig
      ORDER BY m.createdAt DESC
    `,
    { chainId, creatorAddress },
    "READ",
  );

  const fetchedMultisigs = getUniqueMultisigs(result.records.map(mapRecordToMultisig));
  DbMultisigs.parse(fetchedMultisigs);

  return fetchedMultisigs;
};

export const getBelongedMultisigs = async (
  chainId: string,
  memberPubkey: string,
): Promise<readonly DbMultisig[]> => {
  const result = await runCypher(
    `
      MATCH (m:Multisig { chainId: $chainId })
      WHERE m.pubkeyJSON CONTAINS $memberPubkey
      RETURN m {
        .id,
        .chainId,
        .address,
        .pubkeyJSON,
        .creator
      } AS multisig
      ORDER BY m.createdAt DESC
    `,
    { chainId, memberPubkey },
    "READ",
  );

  const fetchedMultisigs = getUniqueMultisigs(result.records.map(mapRecordToMultisig));
  DbMultisigs.parse(fetchedMultisigs);

  return fetchedMultisigs;
};

const DbMultisigAddress = DbMultisig.pick({ address: true });
type DbMultisigAddress = Readonly<z.infer<typeof DbMultisigAddress>>;

export const createMultisig = async (multisig: DbMultisigDraft) => {
  const dbMultisig = await getMultisig(multisig.chainId, multisig.address);

  // Create only if not exists
  if (!dbMultisig) {
    const result = await runCypher(
      `
        CREATE (
          m:Multisig {
            id: $id,
            chainId: $chainId,
            address: $address,
            pubkeyJSON: $pubkeyJSON,
            creator: $creator,
            createdAt: $createdAt
          }
        )
        RETURN m { .address } AS multisig
      `,
      {
        id: randomUUID(),
        chainId: multisig.chainId,
        address: multisig.address,
        pubkeyJSON: multisig.pubkeyJSON,
        creator: multisig.creator ?? null,
        createdAt: new Date().toISOString(),
      },
    );

    const createdMultisig = result.records[0]?.get("multisig");

    if (!createdMultisig) {
      throw new Error("Failed to persist multisig in Neo4j");
    }

    const parsed = DbMultisigAddress.parse(createdMultisig);
    return parsed.address;
  }


  throw new Error(
    `Multisig already exists on ${multisig.chainId} with address ${multisig.address}`,
  );
};
