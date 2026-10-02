import { IssueUserRef } from "../data/issues.js";

declare global {
  namespace Express {
    interface Request {
      user: IssueUserRef;
    }
  }
}

export {};
