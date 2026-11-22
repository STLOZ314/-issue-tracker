import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ApiError, getIssue, updateIssue, type IssueDraft } from "../api";
import { AddIssueForm } from "../components/AddIssueForm";
import type { Issue } from "../types";

type EditState =
  | { kind: "loading"; id: string }
  | { kind: "error"; id: string; message: string }
  | { kind: "loaded"; id: string; issue: Issue };

function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof TypeError) return "Could not reach the server";
  return error instanceof Error ? error.message : "Something went wrong";
}

export function IssueEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState<EditState>({ kind: "loading", id: "" });

  useEffect(() => {
    let active = true;
    getIssue(id).then(
      (issue) => {
        if (active) setState({ kind: "loaded", id, issue });
      },
      (error: unknown) => {
        if (active) setState({ kind: "error", id, message: errorMessage(error) });
      },
    );
    return () => {
      active = false;
    };
  }, [id]);

  if (state.kind === "loading" || state.id !== id) {
    return <p role="status">Loading issue...</p>;
  }

  if (state.kind === "error") {
    return (
      <section className="flex flex-col gap-4">
        <p role="alert">{state.message}</p>
        <Link to="/">Back to all issues</Link>
      </section>
    );
  }

  const { issue } = state;
  const initial: IssueDraft = {
    title: issue.title,
    description: issue.description,
    stepsToReproduce: issue.stepsToReproduce,
    priority: issue.priority,
  };

  async function saveIssue(draft: IssueDraft) {
    await updateIssue(issue._id, draft);
    navigate("/");
  }

  return (
    <section className="flex flex-col gap-4">
      <h2>Edit issue</h2>
      <Link to="/">Back to all issues</Link>
      <AddIssueForm
        initial={initial}
        onAdd={saveIssue}
        submitLabel="Save changes"
        clearOnSuccess={false}
      />
    </section>
  );
}
