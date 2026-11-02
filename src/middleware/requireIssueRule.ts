import type { Request, Response, NextFunction } from "express";

import type { Issue, IssueUserRef } from "../data/issues.js";
import { statement } from "../permissions.js";
import { findIssue } from "./loadIssue.js";
import { userCan } from "./requirePermission.js";

type Resource = keyof typeof statement;

// For rules about WHOSE issue it is. Runs after loadIssue.
export function requireIssueRule(
  check: (issue: Issue, user: IssueUserRef) => boolean,
  message: string,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!check(req.issue, req.user)) {
      res.status(403).json({ error: message });
      return;
    }
    next();
  };
}

// "A role that has the permission, OR the person the rule names."
// Used where both are allowed: assigning an issue (a manager, or the current
// assignee handing it off) and deleting a comment (its author, or a manager).
export function requirePermissionOr<R extends Resource>(
  resource: R,
  action: (typeof statement)[R][number],
  check: (req: Request) => boolean,
  message: string,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (await userCan(req.user.userId, resource, action)) {
        next();
        return;
      }

      const issue = await findIssue(req, res);
      if (!issue) return;
      req.issue = issue;

      if (!check(req)) {
        res.status(403).json({ error: message });
        return;
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
