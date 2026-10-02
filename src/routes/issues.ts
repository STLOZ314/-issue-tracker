import { Router } from "express";
import {
  createIssue,
  deleteIssue,
  getIssueById,
  listIssues,
  updateIssue,
} from "../controllers/issuesController.js";
import { attachCurrentUser } from "../middleware/currentUser.js";
import { validateBody } from "../middleware/validate.js";
import { createIssueSchema, updateIssueSchema } from "../schemas/issueSchemas.js";

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
issuesRouter.delete("/:id", deleteIssue);

export default issuesRouter;
