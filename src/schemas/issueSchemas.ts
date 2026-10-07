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

export const setStatusSchema = z.object({
  status: z.enum(["open", "in-progress", "closed"]),
});

export type SetStatusInput = z.infer<typeof setStatusSchema>;

export const classifyIssueSchema = z.object({
  classification: z.enum(["unclassified", "approved", "unapproved", "duplicate"]),
});

export type ClassifyIssueInput = z.infer<typeof classifyIssueSchema>;

export const assignIssueSchema = z.object({
  userId: z.string().min(1, "userId is required"),
  fullName: z.string().min(1, "fullName is required"),
});

export type AssignIssueInput = z.infer<typeof assignIssueSchema>;

export const setTestCaseResultSchema = z.object({
  passed: z.boolean(),
});

export type SetTestCaseResultInput = z.infer<typeof setTestCaseResultSchema>;

export const addCommentSchema = z.object({
  comment: z.string().min(1, "Comment is required"),
});

export type AddCommentInput = z.infer<typeof addCommentSchema>;
