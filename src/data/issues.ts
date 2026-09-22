export interface Issue {
  id: number;
  title: string;
  description: string;
  status: "open" | "in-progress" | "closed";
  priority: "low" | "medium" | "high";
}

export const issues: Issue[] = [
  {
    id: 1,
    title: "Set up project board",
    description: "Create the initial workflow columns for the team.",
    status: "open",
    priority: "high",
  },
  {
    id: 2,
    title: "Draft API documentation",
    description: "Document the first version of the issue endpoints.",
    status: "in-progress",
    priority: "medium",
  },
  {
    id: 3,
    title: "Review accessibility notes",
    description: "Check the design notes for accessibility requirements.",
    status: "closed",
    priority: "low",
  },
];

let nextId = 4;

export function getNextId(): number {
  return nextId++;
}
