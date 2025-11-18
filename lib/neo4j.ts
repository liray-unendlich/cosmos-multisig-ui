import neo4j, { type Driver, type QueryResult, type SessionMode } from "neo4j-driver";

type CypherParams = Record<string, unknown>;

let driver: Driver | null = null;

const getDriver = (): Driver => {
  if (driver) {
    return driver;
  }

  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !username || !password) {
    throw new Error(
      "Missing Neo4j connection variables. Set NEO4J_URI, NEO4J_USERNAME, and NEO4J_PASSWORD.",
    );
  }

  driver = neo4j.driver(uri, neo4j.auth.basic(username, password), {
    disableLosslessIntegers: true,
  });

  return driver;
};

export const runCypher = async (
  query: string,
  params: CypherParams = {},
  accessMode: SessionMode = "WRITE",
): Promise<QueryResult> => {
  const session = getDriver().session({
    defaultAccessMode: accessMode,
    database: process.env.NEO4J_DATABASE,
  });

  try {
    return await session.run(query, params);
  } finally {
    await session.close();
  }
};
