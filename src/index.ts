import { app } from "./app.js";
import { getDb } from "./db.js";

const PORT = Number(process.env.PORT) || 3000;

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
