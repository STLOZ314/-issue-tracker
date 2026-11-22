import { useState, type ChangeEvent, type FormEvent } from "react";
import { ApiError, type IssueDraft } from "../api";
import type { Priority } from "../types";

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

const priorities: Priority[] = ["low", "medium", "high"];

function isPriority(value: string): value is Priority {
  return priorities.some((priority) => priority === value);
}

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
  const [busy, setBusy] = useState(false);

  function updateField<K extends keyof DraftFields>(
    key: K,
    value: DraftFields[K],
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function handlePriorityChange(event: ChangeEvent<HTMLSelectElement>) {
    if (isPriority(event.currentTarget.value)) {
      updateField("priority", event.currentTarget.value);
    }
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

    setBusy(true);
    try {
      await onAdd(trimmed);
      if (clearOnSuccess) {
        setDraft((current) => ({ ...emptyDraft, priority: current.priority }));
      }
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : "Could not reach the server",
      );
    } finally {
      setBusy(false);
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
            onChange={handlePriorityChange}
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
      </div>
      {serverError && <p role="alert">{serverError}</p>}
      <button type="submit" disabled={busy}>
        {submitLabel}
      </button>
    </form>
  );
}
