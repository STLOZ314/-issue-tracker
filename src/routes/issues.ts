import { Router } from "express";
import {
  assignIssue,
  classifyIssue,
  createIssue,
  deleteIssue,
  getIssueById,
  listIssues,
  setIssueStatus,
  updateIssue,
} from "../controllers/issuesController.js";
import { attachCurrentUser } from "../middleware/currentUser.js";
import { validateBody } from "../middleware/validate.js";
import {
  assignIssueSchema,
  classifyIssueSchema,
  createIssueSchema,
  setStatusSchema,
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
issuesRouter.patch("/:id", validateBody(updateIssueSchema), updateIssue);
issuesRouter.patch("/:id/status", validateBody(setStatusSchema), setIssueStatus);
issuesRouter.patch("/:id/classify", validateBody(classifyIssueSchema), classifyIssue);
issuesRouter.patch("/:id/assign", validateBody(assignIssueSchema), assignIssue);
issuesRouter.delete("/:id", deleteIssue);

export default issuesRouter;
