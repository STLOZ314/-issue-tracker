import { afterAll, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const db = {
    collection: vi.fn(() => ({ createIndex: vi.fn(async () => "created") })),
  };
  const client = {
    connect: vi.fn(async () => undefined),
    db: vi.fn(() => db),
  };

  return {
    db,
    client,
    MongoClient: vi.fn(function (_connectionString: string) {
      return client;
    }),
  };
});

vi.mock("mongodb", () => ({ MongoClient: mocks.MongoClient }));

vi.stubEnv("MONGODB_URI", "mongodb://localhost:27017");

const { getDb } = await import("../src/db.js");

describe("getDb", () => {
  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("reuses the established database connection", async () => {
    const firstDb = await getDb();
    const secondDb = await getDb();

    expect(firstDb).toBe(mocks.db);
    expect(secondDb).toBe(firstDb);
    expect(mocks.MongoClient).toHaveBeenCalledOnce();
    expect(mocks.client.connect).toHaveBeenCalledOnce();
    expect(mocks.client.db).toHaveBeenCalledOnce();
    expect(mocks.client.db).toHaveBeenCalledWith("issueTracker");
  });
});
