export interface IssueUserRef {
  userId: string;
  fullName: string;
}

export interface Issue {
  title: string;
  description: string;
  stepsToReproduce: string;
  status: "open" | "in-progress" | "closed";
  classification: "unclassified" | "approved" | "unapproved" | "duplicate";
  priority: "low" | "medium" | "high";
  author: IssueUserRef;
  assignedTo?: IssueUserRef;
  createdOn: Date;
  comments: unknown[];
  testCases: unknown[];
  timeLog: unknown[];
}
