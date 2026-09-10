const express = require("express");
const { getIssues, getIssueById } = require("../data/issues");

const router = express.Router();

router.get("/", (req, res) => {
  res.json(getIssues());
});

router.get("/:id", (req, res) => {
  const issue = getIssueById(Number(req.params.id));
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }
  res.json(issue);
});

// Updatable fields and their expected JS types
const UPDATABLE_FIELDS = {
  title: "string",
  status: "string",
  assignee: "string",
};

function validatePatchBody(body) {
  if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length === 0) {
    return "Request body must be a non-empty object";
  }
  for (const [field, value] of Object.entries(body)) {
    const expectedType = UPDATABLE_FIELDS[field];
    if (expectedType && typeof value !== expectedType) {
      return `Field "${field}" must be of type ${expectedType}`;
    }
  }
  return null;
}

router.patch("/:id", (req, res) => {
  

  const issue = getIssueById(Number(req.params.id));
  if (!issue) {
    return res.status(404).json({ error: "Issue not found" });
  }

  Object.assign(issue, req.body);
  res.json(issue);
});

module.exports = router;