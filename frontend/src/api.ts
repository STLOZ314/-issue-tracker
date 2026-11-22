import { z } from "zod";
import { issueSchema, statusSchema } from "./types";

import type { CreateIssueInput } from "./schemas/issueForm";
import type { Issue, Status } from "./types";

type FieldProblem = { path: string; message: string };

export type IssueDraft = CreateIssueInput;

const fieldProblemsSchema = z.array(
  z.object({ path: z.string(), message: z.string() }),
);

export class ApiError extends Error {
  readonly status: number;
  readonly details: FieldProblem[];

  constructor(status: number, message: string, details: FieldProblem[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

async function send(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(path, init);
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let details: FieldProblem[] = [];

    try {
      const body: unknown = await res.json();
      if (typeof body === "object" && body !== null) {
        if ("error" in body && typeof body.error === "string") {
          message = body.error;
        }
        if ("details" in body) {
          const parsedDetails = fieldProblemsSchema.safeParse(body.details);
          if (parsedDetails.success) details = parsedDetails.data;
        }
      }
    } catch {
      // The server did not send JSON. The generic message is enough.
    }

    throw new ApiError(res.status, message, details);
  }

  return res;
}

async function getJson<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
): Promise<T> {
  const res = await send(path, init);
  return schema.parse(await res.json());
}

function withBody(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

export function listIssues(): Promise<Issue[]> {
  return getJson("/issues", z.array(issueSchema));
}

export function getIssue(id: string): Promise<Issue> {
  return getJson(`/issues/${encodeURIComponent(id)}`, issueSchema);
}

export function createIssue(draft: IssueDraft): Promise<Issue> {
  return getJson("/issues", issueSchema, withBody("POST", draft));
}

export function updateIssue(
  id: string,
  changes: Partial<IssueDraft>,
): Promise<Issue> {
  return getJson(
    `/issues/${encodeURIComponent(id)}`,
    issueSchema,
    withBody("PATCH", changes),
  );
}

export function setStatus(id: string, status: Status): Promise<Issue> {
  return getJson(
    `/issues/${encodeURIComponent(id)}/status`,
    issueSchema,
    withBody("PATCH", { status: statusSchema.parse(status) }),
  );
}

export async function deleteIssue(id: string): Promise<void> {
  await send(`/issues/${encodeURIComponent(id)}`, { method: "DELETE" });
}
