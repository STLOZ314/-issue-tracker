import request from "supertest";
import { describe, expect, it, vi } from "vitest";

const { fakeCollection } = vi.hoisted(() => ({
  fakeCollection: {
    insertOne: vi.fn(async () => ({ insertedId: "issue-id-1" })),
    find: vi.fn(() => ({
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      toArray: vi.fn(async () => []),
    })),
  },
}));

vi.mock("../src/db.js", () => ({
  getIssuesCollection: () => fakeCollection,
  getDb: vi.fn(),
}));

const { auth } = await import("../src/auth.js");
const { app } = await import("../src/app.js");

describe("issue route authentication", () => {
  it("rejects requests without a valid session", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const response = await request(app).get("/issues");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Please sign in first" });
    expect(fakeCollection.insertOne).not.toHaveBeenCalled();
  });

  it("rejects issue details and create requests before route validation", async () => {
    vi.mocked(auth.api.getSession)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    const details = await request(app).get("/issues/64f000000000000000000001");
    const create = await request(app).post("/issues").send({});

    expect(details.status).toBe(401);
    expect(details.body).toEqual({ error: "Please sign in first" });
    expect(create.status).toBe(401);
    expect(create.body).toEqual({ error: "Please sign in first" });
    expect(fakeCollection.insertOne).not.toHaveBeenCalled();
  });

  it("returns the authenticated user's identity from GET /api/me", async () => {
    const response = await request(app).get("/api/me");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      userId: "user-placeholder-001",
      fullName: "Jordan Casey",
    });
  });

  it("requires a session for GET /api/me", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const response = await request(app).get("/api/me");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Please sign in first" });
  });

  it("uses the signed-in person's name and id when creating an issue", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce({
      session: {},
      user: { id: "auth-user-123", name: "Dana Dev" },
    });

    const response = await request(app).post("/issues").send({
      title: "Authenticated issue",
      description: "Created by the signed-in person",
      stepsToReproduce: "Sign in and create",
      priority: "medium",
    });

    expect(response.status).toBe(201);
    expect(response.body.author).toEqual({
      userId: "auth-user-123",
      fullName: "Dana Dev",
    });
    expect(fakeCollection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        author: { userId: "auth-user-123", fullName: "Dana Dev" },
      }),
    );
  });

  it("allows a signed-in person to list issues", async () => {
    const response = await request(app).get("/issues");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
    expect(fakeCollection.find).toHaveBeenCalledOnce();
  });
});
