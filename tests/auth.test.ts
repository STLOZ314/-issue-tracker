import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getSession } = vi.hoisted(() => ({
  getSession: vi.fn(),
}));

vi.mock("../src/auth.js", () => ({
  auth: {
    handler: vi.fn(async () => new Response(null, { status: 404 })),
    api: { getSession },
  },
}));

const { app } = await import("../src/app.js");

describe("authentication", () => {
  beforeEach(() => {
    getSession.mockReset();
  });

  it("returns 401 on GET /issues when nobody is signed in", async () => {
    getSession.mockResolvedValueOnce(null);

    const response = await request(app).get("/issues");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Please sign in first" });
  });

  it("returns 401 on GET /api/me when nobody is signed in", async () => {
    getSession.mockResolvedValueOnce(null);

    const response = await request(app).get("/api/me");

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: "Please sign in first" });
  });

  it("returns the signed-in user from GET /api/me", async () => {
    getSession.mockResolvedValueOnce({
      user: { id: "u1", name: "Dana Dev" },
    });

    const response = await request(app).get("/api/me");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      userId: "u1",
      fullName: "Dana Dev",
      role: "none",
    });
  });

  it("keeps /health public", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(getSession).not.toHaveBeenCalled();
  });
});
