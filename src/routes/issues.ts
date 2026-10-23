import { Router } from "express";
import {
  addComment,
  addTestCase,
  addTimeLog,
  assignIssue,
  classifyIssue,
  createIssue,
  deleteComment,
  deleteIssue,
  getIssueById,
  getTimeLogSummary,
  listIssues,
  setTestCaseResult,
  setIssueStatus,
  updateIssue,
} from "../controllers/issuesController.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate.js";
import {
  addCommentSchema,
  addTimeLogSchema,
  assignIssueSchema,
  classifyIssueSchema,
  createIssueSchema,
  issueIdParamsSchema,
  listIssuesQuerySchema,
  setStatusSchema,
  setTestCaseResultSchema,
  updateIssueSchema,
} from "../schemas/issueSchemas.js";

const issuesRouter = Router();

issuesRouter.get("/", validateQuery(listIssuesQuerySchema), listIssues);
issuesRouter.get(
  "/:id/time-log/summary",
  validateParams(issueIdParamsSchema),
  getTimeLogSummary,
);
issuesRouter.get("/:id", getIssueById);
issuesRouter.post("/", validateBody(createIssueSchema), createIssue);
issuesRouter.post("/:id/comments", validateBody(addCommentSchema), addComment);
issuesRouter.post("/:id/test-cases", addTestCase);
issuesRouter.patch(
  "/:id/test-cases/:testCaseId",
  validateBody(setTestCaseResultSchema),
  setTestCaseResult,
);
issuesRouter.delete("/:id/comments/:commentId", deleteComment);
issuesRouter.patch("/:id", validateBody(updateIssueSchema), updateIssue);
issuesRouter.patch(
  "/:id/status",
  validateBody(setStatusSchema),
  setIssueStatus,
);
issuesRouter.patch(
  "/:id/classify",
  validateBody(classifyIssueSchema),
  classifyIssue,
);
issuesRouter.patch("/:id/assign", validateBody(assignIssueSchema), assignIssue);
issuesRouter.delete("/:id", deleteIssue);
issuesRouter.post("/:id/time-log", validateBody(addTimeLogSchema), addTimeLog);

export default issuesRouter;
