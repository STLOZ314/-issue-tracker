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

export const listIssuesQuerySchema = z.object({
  status: z.enum(["open", "in-progress", "closed"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  classification: z
    .enum(["unclassified", "approved", "unapproved", "duplicate"])
    .optional(),
  assignedTo: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(["createdOn", "-createdOn"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type ListIssuesQuery = z.infer<typeof listIssuesQuerySchema>;
