import { z } from "zod";

export const createIssueSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  stepsToReproduce: z.string().min(1, "Steps to reproduce are required"),
  priority: z.enum(["low", "medium", "high"]),
});

export type CreateIssueInput = z.infer<typeof createIssueSchema>;

export const updateIssueSchema = createIssueSchema.partial();

export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;
