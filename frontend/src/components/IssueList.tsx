import { useState } from "react";
import { IssueCard } from "./IssueCard";
import {
  statusSchema,
  type Issue,
  type Status,
  type StatusFilter,
} from "../types";

type IssueListProps = {
  issues: Issue[];
  onSelect?: (id: string) => void;
  onStatusChange?: (id: string, status: Status) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
};

export function IssueList({
  issues,
  onSelect,
  onStatusChange,
  onDelete,
}: IssueListProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const visibleIssues =
    statusFilter === "all"
      ? issues
      : issues.filter((issue) => issue.status === statusFilter);

  return (
    <section aria-label="Issue list">
      <label>
        Filter by status
        <select
          value={statusFilter}
          onChange={(event) => {
            const value = event.currentTarget.value;
            setStatusFilter(
              value === "all" ? value : statusSchema.parse(value),
            );
          }}
        >
          <option value="all">all</option>
          <option value="open">open</option>
          <option value="in-progress">in-progress</option>
          <option value="closed">closed</option>
        </select>
      </label>
      <p>Showing {visibleIssues.length} of {issues.length} issues</p>
      {visibleIssues.length === 0 ? (
        <p>No issues to show.</p>
      ) : (
        <ul>
          {visibleIssues.map((issue) => (
            <li key={issue._id}>
              <IssueCard
                issue={issue}
                onSelect={onSelect}
                onStatusChange={onStatusChange}
                onDelete={onDelete}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
