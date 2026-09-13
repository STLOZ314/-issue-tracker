import { Router } from "express";
import {
  createIssue,
  deleteIssue,
  getIssueById,
  listIssues,
  updateIssue,
} from "../controllers/issuesController.js";

const issuesRouter = Router();

issuesRouter.get("/", listIssues);
issuesRouter.get("/:id", getIssueById);
issuesRouter.post("/", createIssue);
issuesRouter.patch("/:id", updateIssue);
issuesRouter.delete("/:id", deleteIssue);

export default issuesRouter;
