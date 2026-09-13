import { NextFunction, Request, Response } from "express";
import { Issue, getNextId, issues } from "../data/issues.js";

export function listIssues(_req: Request, res: Response) {
  res.status(200).json(issues);
}

export function getIssueById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const id = Number(req.params.id);
    const issue = issues.find((i) => i.id === id);
    if (!issue) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }
    res.status(200).json(issue);
  } catch (err) {
    next(err);
  }
}

export function createIssue(req: Request, res: Response) {
  const { title, description, priority } = req.body || {};
  if (!title || typeof title !== "string" || title.trim() === "") {
    res.status(400).json({ error: "Title is required" });
    return;
  }

  const newIssue: Issue = {
    id: getNextId(),
    title,
    description: description || "",
    status: "open",
    priority: priority || "medium",
  };
  issues.push(newIssue);
  res.status(201).json(newIssue);
}

export function updateIssue(req: Request, res: Response) {
  const id = Number(req.params.id);
  const issue = issues.find((i) => i.id === id);
  if (!issue) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }

  const { title, description, status, priority } = req.body || {};
  if (title !== undefined) issue.title = title;
  if (description !== undefined) issue.description = description;
  if (status !== undefined) issue.status = status;
  if (priority !== undefined) issue.priority = priority;

  res.status(200).json(issue);
}

export function deleteIssue(req: Request, res: Response) {
  const id = Number(req.params.id);
  const index = issues.findIndex((i) => i.id === id);
  if (index === -1) {
    res.status(404).json({ error: "Issue not found" });
    return;
  }

  issues.splice(index, 1);
  res.status(204).send();
}
