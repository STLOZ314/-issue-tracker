import express from "express";

const app = express();
const port = 3000;

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Issue tracker listening on port ${port}`);
});
