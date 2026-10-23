import { vi } from "vitest";

vi.mock("../src/auth.js", () => ({
  auth: {
    handler: vi.fn(async () => new Response(null, { status: 404 })),
    api: { getSession: vi.fn().mockResolvedValue(null) },
  },
}));
