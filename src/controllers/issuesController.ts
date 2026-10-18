import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";
import { Document, ObjectId } from "mongodb";
import { getIssuesCollection } from "../db.js";
import { Issue, IssueTimeLogEntry } from "../data/issues.js";
import {
  AddCommentInput,
  AddTimeLogInput,
  AssignIssueInput,
  ClassifyIssueInput,
  CreateIssueInput,
  ListIssuesQuery,
  SetTestCaseResultInput,
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
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = req.query as unknown as ListIssuesQuery;
    const issues = getIssuesCollection();
    const filter: Record<string, unknown> = {};

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;
    if (query.classification) filter.classification = query.classification;
    if (query.assignedTo) filter["assignedTo.userId"] = query.assignedTo;
    const skip = (query.page - 1) * query.limit;

    if (query.q) {
      const pipeline: Document[] = [
        {
          $search: {
            index: "default",
            text: { query: query.q, path: ["title", "description"] },
          },
        },
      ];
      if (Object.keys(filter).length > 0) pipeline.push({ $match: filter });
      if (query.sort) {
        const descending = query.sort.startsWith("-");
        const field = descending ? query.sort.slice(1) : query.sort;
        pipeline.push({ $sort: { [field]: descending ? -1 : 1 } });
      }
      pipeline.push({ $skip: skip }, { $limit: query.limit });
      return res.json(await issues.aggregate(pipeline).toArray());
    }

    const cursor = issues.find(filter);
    if (query.sort) {
      const descending = query.sort.startsWith("-");
      const field = descending ? query.sort.slice(1) : query.sort;
      cursor.sort({ [field]: descending ? -1 : 1 });
    }
    cursor.skip(skip).limit(query.limit);
    res.json(await cursor.toArray());
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

export async function getTimeLogSummary(
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

    const hoursByUser = new Map<string, number>();
    const totalHours = (issue.timeLog ?? []).reduce((total, entry) => {
      hoursByUser.set(
        entry.userId,
        (hoursByUser.get(entry.userId) ?? 0) + entry.hoursWorked,
      );
      return total + entry.hoursWorked;
    }, 0);

    const byUser = Array.from(hoursByUser, ([userId, hours]) => ({
      userId,
      hours,
    })).sort((a, b) => a.userId.localeCompare(b.userId));

    res.status(200).json({
      issueId: objectId.toHexString(),
      totalHours,
      byUser,
    });
  } catch (err) {
    next(err);
  }
}

export async function addTimeLog(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const objectId = parseId(req, res);
  if (!objectId) return;

  try {
    const { hoursWorked } = req.body as AddTimeLogInput;
    const timeLogEntry: IssueTimeLogEntry = {
      userId: req.user.userId,
      hoursWorked,
      loggedOn: new Date(),
    };
    const result = await getIssuesCollection().findOneAndUpdate(
      { _id: objectId },
      {
        $push: {
          timeLog: {
            $each: [timeLogEntry],
            $sort: { loggedOn: 1 },
          },
        },
      },
      { returnDocument: "after" },
    );

    if (!result) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }

    res.status(201).json(result);
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

export async function addComment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const objectId = parseId(req, res);
  if (!objectId) return;

  try {
    const { comment } = req.body as AddCommentInput;
    const newComment = {
      _id: randomUUID(),
      userId: req.user.userId,
      fullName: req.user.fullName,
      comment,
      createdOn: new Date(),
    };
    const result = await getIssuesCollection().findOneAndUpdate(
      { _id: objectId },
      { $push: { comments: newComment } },
      { returnDocument: "after" },
    );
    if (!result) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function addTestCase(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const objectId = parseId(req, res);
  if (!objectId) return;

  try {
    const newTestCase = {
      _id: randomUUID(),
      userId: req.user.userId,
      passed: false,
      createdOn: new Date(),
    };
    const result = await getIssuesCollection().findOneAndUpdate(
      { _id: objectId },
      { $push: { testCases: newTestCase } },
      { returnDocument: "after" },
    );
    if (!result) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function setTestCaseResult(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const objectId = parseId(req, res);
  if (!objectId) return;

  try {
    const testCaseId = req.params.testCaseId as string;
    const { passed } = req.body as SetTestCaseResultInput;
    const result = await getIssuesCollection().findOneAndUpdate(
      { _id: objectId },
      { $set: { "testCases.$[tc].passed": passed } },
      {
        arrayFilters: [{ "tc._id": testCaseId }],
        returnDocument: "after",
      },
    );
    if (!result) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function deleteComment(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const objectId = parseId(req, res);
  if (!objectId) return;

  try {
    const commentId = req.params.commentId as string;
    const result = await getIssuesCollection().findOneAndUpdate(
      { _id: objectId },
      { $pull: { comments: { _id: commentId } } },
      { returnDocument: "after" },
    );
    if (!result) {
      res.status(404).json({ error: "Issue not found" });
      return;
    }
    res.json(result);
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
