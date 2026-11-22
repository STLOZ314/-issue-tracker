import { useState } from "react";
import {
  statusSchema,
  type Issue,
  type Status,
} from "../types";

type IssueCardProps = {
  issue: Issue;
  onSelect?: (id: string) => void;
  onStatusChange?: (id: string, status: Status) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
};

const statuses: Status[] = ["open", "in-progress", "closed"];

export function IssueCard({
  issue,
  onSelect,
  onStatusChange,
  onDelete,
}: IssueCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <article>
      <h2>{issue.title}</h2>
      <p>{issue.description}</p>
      <p>{issue.status}</p>
      <p>Priority: {issue.priority}</p>
      <p>Reported by {issue.author.fullName}</p>
      {onSelect && (
        <button type="button" onClick={() => onSelect(issue._id)}>
          View
        </button>
      )}
      {onStatusChange && (
        <label>
          Status
          <select
            value={issue.status}
            onChange={(event) =>
              void onStatusChange(
                issue._id,
                statusSchema.parse(event.currentTarget.value),
              )
            }
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </label>
      )}
      {onDelete &&
        (confirmingDelete ? (
          <div>
            <p>Delete this issue?</p>
            <button
              type="button"
              onClick={() => {
                setConfirmingDelete(false);
                void onDelete(issue._id);
              }}
            >
              Yes, delete
            </button>
            <button type="button" onClick={() => setConfirmingDelete(false)}>
              Cancel
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setConfirmingDelete(true)}>
            Delete
          </button>
        ))}
    </article>
  );
}
