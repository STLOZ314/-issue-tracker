export interface IssueUserRef {
  userId: string;
  fullName: string;
}

export interface Issue {
  title: string;
  description: string;
  stepsToReproduce: string;
  status: "open" | "in-progress" | "closed";
  classification: string;
  priority: "low" | "medium" | "high";
  author: IssueUserRef;
  createdOn: Date;
  comments: unknown[];
  testCases: unknown[];
  timeLog: unknown[];
}
