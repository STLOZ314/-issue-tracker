import { Router } from "express";
import {
  addComment,
  addTestCase,
  assignIssue,
  classifyIssue,
  createIssue,
  deleteComment,
  deleteIssue,
  getIssueById,
  listIssues,
  setTestCaseResult,
  setIssueStatus,
  updateIssue,
} from "../controllers/issuesController.js";
import { attachCurrentUser } from "../middleware/currentUser.js";
import { validateBody } from "../middleware/validate.js";
import {
  addCommentSchema,
  assignIssueSchema,
  classifyIssueSchema,
  createIssueSchema,
  setStatusSchema,
  setTestCaseResultSchema,
  updateIssueSchema,
} from "../schemas/issueSchemas.js";

const issuesRouter = Router();

issuesRouter.get("/", listIssues);
issuesRouter.get("/:id", getIssueById);
issuesRouter.post(
  "/",
  attachCurrentUser,
  validateBody(createIssueSchema),
  createIssue,
);
issuesRouter.post(
  "/:id/comments",
  attachCurrentUser,
  validateBody(addCommentSchema),
  addComment,
);
issuesRouter.post("/:id/test-cases", attachCurrentUser, addTestCase);
issuesRouter.patch(
  "/:id/test-cases/:testCaseId",
  validateBody(setTestCaseResultSchema),
  setTestCaseResult,
);
issuesRouter.delete("/:id/comments/:commentId", deleteComment);
issuesRouter.patch("/:id", validateBody(updateIssueSchema), updateIssue);
issuesRouter.patch("/:id/status", validateBody(setStatusSchema), setIssueStatus);
issuesRouter.patch("/:id/classify", validateBody(classifyIssueSchema), classifyIssue);
issuesRouter.patch("/:id/assign", validateBody(assignIssueSchema), assignIssue);
issuesRouter.delete("/:id", deleteIssue);

export default issuesRouter;
