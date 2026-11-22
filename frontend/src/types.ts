import { z } from "zod";

export const statusSchema = z.enum(["open", "in-progress", "closed"]);
export const prioritySchema = z.enum(["low", "medium", "high"]);

const userRefSchema = z.object({
  userId: z.string(),
  fullName: z.string(),
});

export const issueSchema = z.object({
  _id: z.string(),
  title: z.string(),
  description: z.string(),
  stepsToReproduce: z.string(),
  priority: prioritySchema,
  status: statusSchema,
  author: userRefSchema,
  assignedTo: userRefSchema.optional(),
  createdOn: z.string(),
});

export const issueDraftSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  stepsToReproduce: z.string().min(1),
  priority: prioritySchema,
});

export type Status = z.infer<typeof statusSchema>;
export type Priority = z.infer<typeof prioritySchema>;
export type Issue = z.infer<typeof issueSchema>;
export type StatusFilter = Status | "all";
export type IssueDraft = z.infer<typeof issueDraftSchema>;
