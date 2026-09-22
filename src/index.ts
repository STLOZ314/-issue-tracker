import express from "express";
import path from "node:path";

import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/logger.js";
import issuesRouter from "./routes/issues.js";
import { getDb } from "./db.js";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(requestLogger);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/issues", issuesRouter);

app.use(express.static(path.join(import.meta.dirname, "../frontend/dist")));

app.use(errorHandler);

async function startServer() {
  await getDb();
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((error: unknown) => {
  console.error("Failed to connect to MongoDB", error);
  process.exit(1);
});
