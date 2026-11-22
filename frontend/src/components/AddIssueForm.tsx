import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, type Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, type IssueDraft } from "../api";
import { createIssueSchema } from "../schemas/issueForm";

type AddIssueFormProps = {
  onAdd: (draft: IssueDraft) => void | Promise<void>;
  initial?: IssueDraft;
  submitLabel?: string;
  clearOnSuccess?: boolean;
};

const emptyDraft: IssueDraft = {
  title: "",
  description: "",
  stepsToReproduce: "",
  priority: "medium",
};

const resolver: Resolver<IssueDraft> = (values, context, options) => {
  const trimmed = {
    ...values,
    title: values.title.trim(),
    description: values.description.trim(),
    stepsToReproduce: values.stepsToReproduce.trim(),
  };
  return zodResolver(createIssueSchema)(trimmed, context, options);
};

const fieldNames = ["title", "description", "stepsToReproduce", "priority"] as const;
type FieldName = (typeof fieldNames)[number];

function isFieldName(value: string): value is FieldName {
  return fieldNames.some((name) => name === value);
}

export function AddIssueForm({
  onAdd,
  initial = emptyDraft,
  submitLabel = "Add issue",
  clearOnSuccess = true,
}: AddIssueFormProps) {
  const form = useForm<IssueDraft>({ resolver, defaultValues: initial });

  async function onValid(draft: IssueDraft) {
    try {
      await onAdd(draft);
      if (clearOnSuccess) form.reset(emptyDraft);
    } catch (error) {
      if (!(error instanceof ApiError)) {
        form.setError("root.server", { message: "Could not reach the server" });
        return;
      }

      let placed = false;
      for (const detail of error.details) {
        if (isFieldName(detail.path)) {
          form.setError(detail.path, { type: "server", message: detail.message });
          placed = true;
        }
      }
      if (!placed) form.setError("root.server", { message: error.message });
    }
  }

  const rootMessage = form.formState.errors.root?.server?.message;

  return (
    <form onSubmit={form.handleSubmit(onValid)} noValidate className="rounded-lg border p-4">
      <FieldGroup>
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="issue-title">Title</FieldLabel>
              <Input {...field} id="issue-title" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="issue-description">Description</FieldLabel>
              <Textarea {...field} id="issue-description" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="stepsToReproduce"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="issue-steps">Steps to reproduce</FieldLabel>
              <Textarea {...field} id="issue-steps" aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="priority"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="issue-priority">Priority</FieldLabel>
              <NativeSelect {...field} id="issue-priority" aria-invalid={fieldState.invalid}>
                <NativeSelectOption value="low">low</NativeSelectOption>
                <NativeSelectOption value="medium">medium</NativeSelectOption>
                <NativeSelectOption value="high">high</NativeSelectOption>
              </NativeSelect>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        {rootMessage && <FieldError>{rootMessage}</FieldError>}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {submitLabel}
        </Button>
      </FieldGroup>
    </form>
  );
}
