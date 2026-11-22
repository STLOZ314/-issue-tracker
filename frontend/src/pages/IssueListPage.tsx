import { useEffect, useState } from "react";
import { ApiError, createIssue, deleteIssue, listIssues, setStatus } from "../api";
import { AddIssueForm } from "../components/AddIssueForm";
import { IssueList } from "../components/IssueList";
import type { Issue, IssueDraft, Status } from "../types";

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "loaded"; issues: Issue[] };

type IssueListPageProps = {
  onSelect?: (id: string) => void;
};

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) return "Could not reach the server";
  return error instanceof Error ? error.message : "Something went wrong";
}

export function IssueListPage({ onSelect }: IssueListPageProps) {
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [mutationError, setMutationError] = useState("");

  useEffect(() => {
    let active = true;
    listIssues().then(
      (issues) => {
        if (active) setState({ kind: "loaded", issues });
      },
      (error: unknown) => {
        if (active) setState({ kind: "error", message: errorMessage(error) });
      },
    );
    return () => {
      active = false;
    };
  }, []);

  async function addIssue(draft: IssueDraft) {
    const created = await createIssue(draft);
    setState((current) =>
      current.kind === "loaded"
        ? { ...current, issues: [...current.issues, created] }
        : current,
    );
  }

  async function changeStatus(id: string, status: Status) {
    setMutationError("");
    try {
      const updated = await setStatus(id, status);
      setState((current) =>
        current.kind === "loaded"
          ? {
              ...current,
              issues: current.issues.map((issue) =>
                issue._id === id ? updated : issue,
              ),
            }
          : current,
      );
    } catch (error) {
      setMutationError(errorMessage(error));
    }
  }

  async function removeIssue(id: string) {
    setMutationError("");
    try {
      await deleteIssue(id);
      setState((current) =>
        current.kind === "loaded"
          ? {
              ...current,
              issues: current.issues.filter((issue) => issue._id !== id),
            }
          : current,
      );
    } catch (error) {
      setMutationError(errorMessage(error));
    }
  }

  if (state.kind === "loading") {
    return <p role="status">Loading issues...</p>;
  }

  if (state.kind === "error") {
    return <p role="alert">{state.message}</p>;
  }

  return (
    <section>
      <h2>Issues</h2>
      {mutationError && <p role="alert">{mutationError}</p>}
      <AddIssueForm onAdd={addIssue} />
      {state.issues.length === 0 && (
        <p>No issues yet. Add the first one.</p>
      )}
      <IssueList
        issues={state.issues}
        onSelect={onSelect}
        onStatusChange={changeStatus}
        onDelete={removeIssue}
      />
    </section>
  );
}
