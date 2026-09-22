import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getIssuesCollection } from "../db.js";
import { Issue } from "../data/issues.js";

export async function listIssues(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const issues = await getIssuesCollection().find({}).toArray();
    res.status(200).json(issues);
  } catch (err) {
    next(err);
  }
}

export async function getIssueById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let objectId: ObjectId;
  const id = req.params.id;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid issue id" });
    return;
  }

  try {
    objectId = new ObjectId(id);
  } catch {
    res.status(400).json({ error: "Invalid issue id" });
    return;
  }

  try {
    const issue = await getIssuesCollection().findOne({ _id: objectId });
    if (!issue) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }
    res.status(200).json(issue);
  } catch (err) {
    next(err);
  }
}

export async function createIssue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { title, description, priority } = req.body || {};
    if (!title || typeof title !== "string" || title.trim() === "") {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const newIssue: Issue = {
      title,
      description: description || "",
      status: "open",
      priority: priority || "medium",
    };
    const result = await getIssuesCollection().insertOne(newIssue);
    res.status(201).json({ _id: result.insertedId, ...newIssue });
  } catch (err) {
    next(err);
  }
}

export async function updateIssue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let objectId: ObjectId;
  const id = req.params.id;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid issue id" });
    return;
  }

  try {
    objectId = new ObjectId(id);
  } catch {
    res.status(400).json({ error: "Invalid issue id" });
    return;
  }

  try {
    const { title, description, status, priority } = req.body || {};
    const updates: Partial<Issue> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;

    const issues = getIssuesCollection();
    const result = await issues.updateOne({ _id: objectId }, { $set: updates });
    if (result.matchedCount === 0) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }

    const issue = await issues.findOne({ _id: objectId });
    res.status(200).json(issue);
  } catch (err) {
    next(err);
  }
}

export async function deleteIssue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  let objectId: ObjectId;
  const id = req.params.id;

  if (typeof id !== "string") {
    res.status(400).json({ error: "Invalid issue id" });
    return;
  }

  try {
    objectId = new ObjectId(id);
  } catch {
    res.status(400).json({ error: "Invalid issue id" });
    return;
  }

  try {
    const result = await getIssuesCollection().deleteOne({ _id: objectId });
    if (result.deletedCount === 0) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
