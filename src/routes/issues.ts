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
  markIssueFixed,
  setTestCaseResult,
  setIssueStatus,
  updateIssue,
} from "../controllers/issuesController.js";
import {
  canDeleteComment,
  canEditIssue,
  canWorkOnIssue,
} from "../issueRules.js";
import { loadIssue } from "../middleware/loadIssue.js";
import { requireAssignableUser } from "../middleware/requireAssignableUser.js";
import { requirePermission } from "../middleware/requirePermission.js";
import {
  requireIssueRule,
  requirePermissionOr,
} from "../middleware/requireIssueRule.js";
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
  markFixedSchema,
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

// ...and this one runs the check for every status EXCEPT closed.
function exceptWhenClosing(check: RequestHandler): RequestHandler {
  return (req, res, next) =>
    req.body.status === "closed" ? next() : check(req, res, next);
}

// Reused wherever the rule is "only the person this issue is assigned to".
const assigneeOnly = [
  loadIssue,
  requireIssueRule(
    canWorkOnIssue,
    "Only the person this issue is assigned to may do that",
  ),
];

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
  assigneeOnly,
  addTestCase,
);
issuesRouter.patch(
  "/:id/test-cases/:testCaseId",
  requirePermission("testCase", "setResult"),
  assigneeOnly,
  validateBody(setTestCaseResultSchema),
  setTestCaseResult,
);
issuesRouter.delete(
  "/:id/comments/:commentId",
  requirePermissionOr(
    "comment",
    "deleteAny",
    (req) =>
      canDeleteComment(req.issue, req.params.commentId as string, req.user),
    "Only the comment's author or a Technical Manager may delete it",
  ),
  deleteComment,
);
issuesRouter.patch(
  "/:id",
  validateBody(updateIssueSchema),
  loadIssue,
  requireIssueRule(
    canEditIssue,
    "Only the author may edit this issue",
  ),
  updateIssue,
);
issuesRouter.patch(
  "/:id/fixed",
  requirePermission("issue", "markFixed"),
  assigneeOnly,
  validateBody(markFixedSchema),
  markIssueFixed,
);
issuesRouter.patch(
  "/:id/status",
  validateBody(setStatusSchema),
  onlyWhenClosing(requirePermission("issue", "close")),
  exceptWhenClosing(loadIssue),
  exceptWhenClosing(
    requireIssueRule(
      canWorkOnIssue,
      "Only the person this issue is assigned to may do that",
    ),
  ),
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
  requirePermissionOr(
    "issue",
    "assign",
    (req) => canWorkOnIssue(req.issue, req.user),
    "Only a manager, or the person this issue is assigned to, may assign it",
  ),
  validateBody(assignIssueSchema),
  requireAssignableUser,
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
