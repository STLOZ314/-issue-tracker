import express from "express";
import path from "node:path";

import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/logger.js";
import issuesRouter from "./routes/issues.js";

export const app = express();

app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/issues", issuesRouter);

app.use(express.static(path.join(import.meta.dirname, "../frontend/dist")));

app.use(errorHandler);
