import express from "express";

import { errorHandler } from "./middleware/errorHandler";
import { requestLogger } from "./middleware/logger";
import issuesRouter from "./routes/issues";

const app = express();
const port = 3000;

app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/issues", issuesRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Issue tracker listening on port ${port}`);
});
