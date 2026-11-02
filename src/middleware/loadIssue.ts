import type { Request, Response, NextFunction } from "express";
import { ObjectId } from "mongodb";

import type { Issue } from "../data/issues.js";
import { getIssuesCollection } from "../db.js";

// Finds the issue named in the URL. If it cannot, it has already answered
// the request (400 or 404) and returns undefined.
export async function findIssue(
  req: Request,
  res: Response,
): Promise<Issue | undefined> {
  let id: ObjectId;
  try {
    id = new ObjectId(req.params.id as string);
  } catch {
    res.status(400).json({ error: "Invalid issue id" });
    return undefined;
  }

  const issue = await getIssuesCollection().findOne({ _id: id });
  if (!issue) {
    res.status(404).json({ error: "Issue not found" });
    return undefined;
  }
  return issue;
}

// Middleware: put the issue on req.issue so the next function can look at it.
export async function loadIssue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const issue = await findIssue(req, res);
    if (!issue) return;
    req.issue = issue;
    next();
  } catch (err) {
    next(err);
  }
}
