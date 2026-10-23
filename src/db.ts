import { Collection, Db, MongoClient } from "mongodb";
import { Issue } from "./data/issues.js";

let db: Db | undefined;

export async function getDb(): Promise<Db> {
  if (db) return db;

  if (!db) {
    const connectionString = process.env.MONGODB_URI;
    if (!connectionString) {
      throw new Error("MONGODB_URI is not configured");
    }

    const client = new MongoClient(connectionString);
    await client.connect();
    db = client.db("issueTracker");
    await db
      .collection<Issue>("issues")
      .createIndex({ status: 1, createdOn: -1 });
  }

  return db;
}

export function getIssuesCollection(): Collection<Issue> {
  if (!db) {
    throw new Error("Database connection has not been established");
  }

  return db.collection<Issue>("issues");
}
