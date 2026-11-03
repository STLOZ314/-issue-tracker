import { tool } from "ai";
import { z } from "zod";
import { getIssuesCollection } from "../db.js";

// The model chooses the words, so they are untrusted.
// Escape them before they go into a regex.
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const searchIssues = tool({
  description:
    "Look for existing issues whose title contains these words. " +
    "Returns at most 5 as id, title, status.",
  inputSchema: z.object({
    words: z
      .string()
      .min(1)
      .max(60)
      .describe("One or two key words from the new issue"),
  }),
  execute: async ({ words }) => {
    const found = await getIssuesCollection()
      .find(
        { title: { $regex: escapeRegExp(words), $options: "i" } },
        { projection: { title: 1, status: 1 } },
      )
      .limit(5)
      .toArray();
    return found.map((issue) => ({
      id: String(issue._id),
      title: issue.title,
      status: issue.status,
    }));
  },
});
