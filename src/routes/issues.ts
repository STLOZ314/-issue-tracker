import { Router, type RequestHandler } from "express";
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
import { requirePermission } from "../middleware/requirePermission.js";
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

// Runs the permission check only when the request is trying to CLOSE the issue.
function onlyWhenClosing(check: RequestHandler): RequestHandler {
  return (req, res, next) =>
    req.body.status === "closed" ? check(req, res, next) : next();
}

issuesRouter.get("/", validateQuery(listIssuesQuerySchema), listIssues);
issuesRouter.get(
  "/:id/time-log/summary",
  validateParams(issueIdParamsSchema),
  getTimeLogSummary,
);
issuesRouter.get("/:id", getIssueById);
issuesRouter.post(
  "/",
  requirePermission("issue", "create"),
  validateBody(createIssueSchema),
  createIssue,
);
issuesRouter.post(
  "/:id/comments",
  requirePermission("comment", "create"),
  validateBody(addCommentSchema),
  addComment,
);
issuesRouter.post(
  "/:id/test-cases",
  requirePermission("testCase", "create"),
  addTestCase,
);
issuesRouter.patch(
  "/:id/test-cases/:testCaseId",
  requirePermission("testCase", "setResult"),
  validateBody(setTestCaseResultSchema),
  setTestCaseResult,
);
issuesRouter.delete("/:id/comments/:commentId", deleteComment);
issuesRouter.patch("/:id", validateBody(updateIssueSchema), updateIssue);
issuesRouter.patch(
  "/:id/status",
  validateBody(setStatusSchema),
  onlyWhenClosing(requirePermission("issue", "close")),
  setIssueStatus,
);
issuesRouter.patch(
  "/:id/classify",
  requirePermission("issue", "classify"),
  validateBody(classifyIssueSchema),
  classifyIssue,
);
issuesRouter.patch(
  "/:id/assign",
  requirePermission("issue", "assign"),
  validateBody(assignIssueSchema),
  assignIssue,
);
issuesRouter.delete("/:id", requirePermission("issue", "delete"), deleteIssue);
issuesRouter.post(
  "/:id/time-log",
  requirePermission("timeLog", "create"),
  validateBody(addTimeLogSchema),
  addTimeLog,
);

export default issuesRouter;
