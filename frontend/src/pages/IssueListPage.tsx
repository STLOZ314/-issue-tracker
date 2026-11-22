import { useEffect, useState } from "react";
import {
  ApiError,
  createIssue,
  deleteIssue,
  listIssues,
  setStatus,
  type IssueDraft,
} from "../api";
import { AddIssueForm } from "../components/AddIssueForm";
import { IssueList } from "../components/IssueList";
import type { Issue, Status } from "../types";

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "loaded"; issues: Issue[] };

type IssueListPageProps = {
  onSelect?: (id: string) => void;
};

function messageFor(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "Could not reach the server";
}

export function IssueListPage({ onSelect }: IssueListPageProps) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      try {
        const issues = await listIssues();
        if (!ignore) setState({ kind: "loaded", issues });
      } catch (error) {
        if (!ignore) setState({ kind: "error", message: messageFor(error) });
      }
    };

    void load();
    return () => {
      ignore = true;
    };
  }, []);

  function replaceIssues(change: (issues: Issue[]) => Issue[]) {
    setState((current) =>
      current.kind === "loaded"
        ? { kind: "loaded", issues: change(current.issues) }
        : current,
    );
  }

  async function handleAdd(draft: IssueDraft) {
    const created = await createIssue(draft);
    replaceIssues((issues) => [...issues, created]);
  }

  async function handleStatusChange(id: string, status: Status) {
    setActionError(null);
    try {
      const updated = await setStatus(id, status);
      replaceIssues((issues) =>
        issues.map((issue) => (issue._id === id ? updated : issue)),
      );
    } catch (error) {
      setActionError(messageFor(error));
    }
  }

  async function handleDelete(id: string) {
    setActionError(null);
    try {
      await deleteIssue(id);
      replaceIssues((issues) => issues.filter((issue) => issue._id !== id));
    } catch (error) {
      setActionError(messageFor(error));
    }
  }

  if (state.kind === "loading") {
    return <p role="status">Loading issues...</p>;
  }

  if (state.kind === "error") {
    return <p role="alert">{state.message}</p>;
  }

  return (
    <>
      <AddIssueForm onAdd={handleAdd} />
      {actionError && <p role="alert">{actionError}</p>}
      {state.issues.length === 0 ? (
        <p>No issues yet. Add the first one.</p>
      ) : (
        <IssueList
          issues={state.issues}
          onSelect={onSelect}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
