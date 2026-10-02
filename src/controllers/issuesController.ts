import { NextFunction, Request, Response } from "express";
import { ObjectId } from "mongodb";
import { getIssuesCollection } from "../db.js";
import { Issue } from "../data/issues.js";
import {
  AssignIssueInput,
  ClassifyIssueInput,
  CreateIssueInput,
  SetStatusInput,
  UpdateIssueInput,
} from "../schemas/issueSchemas.js";

function parseId(req: Request, res: Response): ObjectId | undefined {
  try {
    return new ObjectId(req.params.id as string);
  } catch {
    res.status(400).json({ error: "Invalid issue id" });
    return undefined;
  }
}

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
  const objectId = parseId(req, res);
  if (!objectId) return;

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
    const input = req.body as CreateIssueInput;
    const newIssue: Issue = {
      ...input,
      status: "open",
      classification: "unclassified",
      author: req.user, // never req.body - identity must come from the server
      createdOn: new Date(),
      comments: [],
      testCases: [],
      timeLog: [],
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
  const objectId = parseId(req, res);
  if (!objectId) return;

  try {
    const updates = req.body as UpdateIssueInput;

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

export async function setIssueStatus(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const objectId = parseId(req, res);
  if (!objectId) return;

  try {
    const { status } = req.body as SetStatusInput;
    const result = await getIssuesCollection().findOneAndUpdate(
      { _id: objectId },
      { $set: { status } },
      { returnDocument: "after" },
    );
    if (!result) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function classifyIssue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const objectId = parseId(req, res);
  if (!objectId) return;

  try {
    const { classification } = req.body as ClassifyIssueInput;
    const result = await getIssuesCollection().findOneAndUpdate(
      { _id: objectId },
      { $set: { classification } },
      { returnDocument: "after" },
    );
    if (!result) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function assignIssue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const objectId = parseId(req, res);
  if (!objectId) return;

  try {
    const { userId, fullName } = req.body as AssignIssueInput;
    const result = await getIssuesCollection().findOneAndUpdate(
      { _id: objectId },
      { $set: { assignedTo: { userId, fullName } } },
      { returnDocument: "after" },
    );
    if (!result) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteIssue(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const objectId = parseId(req, res);
  if (!objectId) return;

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
