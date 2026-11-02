export interface IssueUserRef {
  userId: string;
  fullName: string;
}

export interface IssueTimeLogEntry {
  userId: string;
  hoursWorked: number;
  loggedOn: Date;
}

export interface IssueComment {
  _id: string;
  userId: string;
  fullName: string;
  comment: string;
  createdOn: Date;
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
  updatedBy?: IssueUserRef;
  updatedAt?: Date;
  closedBy?: IssueUserRef;
  closedAt?: Date;
  comments: IssueComment[];
  testCases: unknown[];
  timeLog: IssueTimeLogEntry[];
}
