import { gql } from "graphql-request";
import { z } from "zod";
import { gqlClient } from ".";

export const DbMultisig = z.object({
  id: z.string(),
  chainId: z.string(),
  address: z.string(),
  pubkeyJSON: z.string(),
});
export type DbMultisig = Readonly<z.infer<typeof DbMultisig>>;

export type DbMultisigDraft = Omit<DbMultisig, "id">;

export const DbMultisigId = DbMultisig.pick({ id: true });
export type DbMultisigId = Readonly<z.infer<typeof DbMultisigId>>;

export const getMultisig = async (
  chainId: string,
  multisigAddress: string,
): Promise<DbMultisig | null> => {
  type Response = { readonly queryMultisig: readonly DbMultisig[] };
  type Variables = { readonly chainId: string; readonly multisigAddress: string };

  const { queryMultisig } = await gqlClient.request<Response, Variables>(
    gql`
      query GetMultisig($chainId: String!, $multisigAddress: String!) {
        queryMultisig(filter: { chainId: { eq: $chainId }, address: { eq: $multisigAddress } }) {
          id
          chainId
          address
          pubkeyJSON
        }
      }
    `,
    { chainId, multisigAddress },
  );

  if (!queryMultisig.length) {
    return null;
  }

  const fetchedMultisig = queryMultisig[0];

  DbMultisig.parse(fetchedMultisig);

  return fetchedMultisig;
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
  type Response = { readonly queryMultisig: readonly DbMultisig[] };
  type Variables = { readonly chainId: string; readonly creatorAddress: string };

  const { queryMultisig } = await gqlClient.request<Response, Variables>(
    gql`
      query GetCreatedMultisigs($chainId: String!, $creatorAddress: String!) {
        queryMultisig(filter: { chainId: { eq: $chainId }, creator: { eq: $creatorAddress } }) {
          id
          chainId
          address
          pubkeyJSON
        }
      }
    `,
    { chainId, creatorAddress },
  );

  const fetchedMultisigs = getUniqueMultisigs(queryMultisig);
  DbMultisigs.parse(fetchedMultisigs);

  return fetchedMultisigs;
};

export const getBelongedMultisigs = async (
  chainId: string,
  memberPubkey: string,
): Promise<readonly DbMultisig[]> => {
  type Response = { readonly queryMultisig: readonly DbMultisig[] };
  type Variables = { readonly chainId: string; readonly memberPubkey: string };

  const { queryMultisig } = await gqlClient.request<Response, Variables>(
    gql`
      query GetBelongedMultisigs($chainId: String!, $memberPubkey: String!) {
        queryMultisig(
          filter: { chainId: { eq: $chainId }, pubkeyJSON: { alloftext: $memberPubkey } }
        ) {
          id
          chainId
          address
          pubkeyJSON
        }
      }
    `,
    { chainId, memberPubkey },
  );

  const fetchedMultisigs = getUniqueMultisigs(queryMultisig);
  DbMultisigs.parse(fetchedMultisigs);

  return fetchedMultisigs;
};

const DbMultisigAddress = DbMultisig.pick({ address: true });
type DbMultisigAddress = Readonly<z.infer<typeof DbMultisigAddress>>;

export const createMultisig = async (multisig: DbMultisigDraft) => {
  const dbMultisig = await getMultisig(multisig.chainId, multisig.address);

  // Create only if not exists
  if (!dbMultisig) {
    type Response = { readonly addMultisig: { readonly multisig: readonly DbMultisigAddress[] } };
    type Variables = DbMultisigDraft;

    const { addMultisig } = await gqlClient.request<Response, Variables>(
      gql`
        mutation CreateMultisig(
          $chainId: String!
          $address: String!
          $pubkeyJSON: String!
        ) {
          addMultisig(
            input: {
              chainId: $chainId
              address: $address
              pubkeyJSON: $pubkeyJSON
            }
          ) {
            multisig {
              address
            }
          }
        }
      `,
      multisig,
    );

    const createdMultisig = addMultisig.multisig[0];
    DbMultisigAddress.parse(createdMultisig);

    return createdMultisig.address;
  }


  throw new Error(
    `Multisig already exists on ${multisig.chainId} with address ${multisig.address}`,
  );
};
