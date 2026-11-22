import { useState, type FormEvent } from "react";
import { ApiError } from "../api";
import {
  prioritySchema,
  type IssueDraft,
  type Priority,
} from "../types";

type AddIssueFormProps = {
  onAdd: (draft: IssueDraft) => void | Promise<void>;
  initial?: IssueDraft;
  submitLabel?: string;
  clearOnSuccess?: boolean;
};

type DraftFields = {
  title: string;
  description: string;
  stepsToReproduce: string;
  priority: Priority;
};

const emptyDraft: DraftFields = {
  title: "",
  description: "",
  stepsToReproduce: "",
  priority: "medium",
};

export function AddIssueForm({
  onAdd,
  initial = emptyDraft,
  submitLabel = "Add issue",
  clearOnSuccess = true,
}: AddIssueFormProps) {
  const [draft, setDraft] = useState<DraftFields>(initial);
  const [problems, setProblems] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");

  function updateField<K extends keyof DraftFields>(
    key: K,
    value: DraftFields[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      stepsToReproduce: draft.stepsToReproduce.trim(),
    };
    const nextProblems: Record<string, string> = {};

    if (!trimmed.title) nextProblems.title = "Title is required";
    if (!trimmed.description) nextProblems.description = "Description is required";
    if (!trimmed.stepsToReproduce) {
      nextProblems.stepsToReproduce = "Steps to reproduce are required";
    }

    setProblems(nextProblems);
    setServerError("");
    if (Object.keys(nextProblems).length > 0) return;

    try {
      await onAdd(trimmed);
      if (clearOnSuccess) setDraft(emptyDraft);
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : error instanceof TypeError
            ? "Could not reach the server"
            : error instanceof Error
              ? error.message
              : "Something went wrong",
      );
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)} noValidate>
      <div>
        <label>
          Title
          <input
            value={draft.title}
            onChange={(event) => updateField("title", event.currentTarget.value)}
            aria-invalid={Boolean(problems.title)}
          />
        </label>
        {problems.title && <p role="alert">{problems.title}</p>}
      </div>
      <div>
        <label>
          Description
          <textarea
            value={draft.description}
            onChange={(event) =>
              updateField("description", event.currentTarget.value)
            }
            aria-invalid={Boolean(problems.description)}
          />
        </label>
        {problems.description && <p role="alert">{problems.description}</p>}
      </div>
      <div>
        <label>
          Steps to reproduce
          <textarea
            value={draft.stepsToReproduce}
            onChange={(event) =>
              updateField("stepsToReproduce", event.currentTarget.value)
            }
            aria-invalid={Boolean(problems.stepsToReproduce)}
          />
        </label>
        {problems.stepsToReproduce && (
          <p role="alert">{problems.stepsToReproduce}</p>
        )}
      </div>
      <div>
        <label>
          Priority
          <select
            value={draft.priority}
            onChange={(event) =>
              updateField(
                "priority",
                prioritySchema.parse(event.currentTarget.value),
              )
            }
          >
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
        </label>
      </div>
      {serverError && <p role="alert">{serverError}</p>}
      <button type="submit">{submitLabel}</button>
    </form>
  );
}
