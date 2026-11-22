import { useState, type ChangeEvent } from "react";
import type { Issue, Status, StatusFilter } from "../types";
import { IssueCard } from "./IssueCard";

type IssueListProps = {
  issues: Issue[];
  onSelect?: (id: string) => void;
  onStatusChange?: (id: string, status: Status) => void;
  onDelete?: (id: string) => void;
};

const filters: StatusFilter[] = ["all", "open", "in-progress", "closed"];

function isStatusFilter(value: string): value is StatusFilter {
  return filters.some((filter) => filter === value);
}

export function IssueList({
  issues,
  onSelect,
  onStatusChange,
  onDelete,
}: IssueListProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");

  function handleFilterChange(event: ChangeEvent<HTMLSelectElement>) {
    if (isStatusFilter(event.currentTarget.value)) {
      setFilter(event.currentTarget.value);
    }
  }

  const shown =
    filter === "all" ? issues : issues.filter((issue) => issue.status === filter);

  return (
    <section>
      <label>
        Filter by status
        <select value={filter} onChange={handleFilterChange}>
          {filters.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <p>
        Showing {shown.length} of {issues.length} issues
      </p>
      {shown.length === 0 ? (
        <p>No issues to show.</p>
      ) : (
        <ul>
          {shown.map((issue) => (
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
