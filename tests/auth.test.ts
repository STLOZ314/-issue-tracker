import request from "supertest";
import { describe, expect, it, vi } from "vitest";

import { auth } from "../src/auth.js";
const { app } = await import("../src/app.js");

describe("Better Auth Express integration", () => {
  it("uses the shared auth stand-in for auth requests", async () => {
    const response = await request(app).post("/api/auth/sign-up/email").send({
      email: "student@example.com",
      password: "correct-horse-battery",
    });

    expect(response.status).toBe(404);
    expect(vi.mocked(auth.handler)).toHaveBeenCalledOnce();
  });
});
