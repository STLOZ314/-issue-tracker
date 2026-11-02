import { Issue, IssueUserRef } from "../data/issues.js";

declare global {
  namespace Express {
    interface Request {
      user: IssueUserRef;
      role: string;
      issue: Issue;
    }
  }
}

export {};
