import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import type { Issue, Status } from "../types";

type IssueCardProps = {
  issue: Issue;
  onSelect?: (id: string) => void;
  onStatusChange?: (id: string, status: Status) => void;
  onDelete?: (id: string) => void;
};

const priorityBadge = {
  low: "secondary",
  medium: "outline",
  high: "destructive",
} as const;

export function IssueCard({
  issue,
  onSelect,
  onStatusChange,
  onDelete,
}: IssueCardProps) {
  const [confirming, setConfirming] = useState(false);

  return (
    <article>
      <Card>
        <CardContent className="flex flex-col gap-3">
          <h3 className="text-base font-medium">{issue.title}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{issue.status}</Badge>
            <Badge variant={priorityBadge[issue.priority]}>Priority: {issue.priority}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">Reported by {issue.author.fullName}</p>
          <div className="flex flex-wrap items-center gap-2">
            {onSelect && (
              <Button type="button" variant="outline" size="sm" onClick={() => onSelect(issue._id)}>
                View
              </Button>
            )}
            {onStatusChange && (
              <label className="flex items-center gap-2 text-sm">
                Status
                <NativeSelect
                  size="sm"
                  value={issue.status}
                  onChange={(event) => {
                    const status = event.currentTarget.value;
                    if (
                      status === "open" ||
                      status === "in-progress" ||
                      status === "closed"
                    ) {
                      onStatusChange(issue._id, status);
                    }
                  }}
                >
                  <NativeSelectOption value="open">open</NativeSelectOption>
                  <NativeSelectOption value="in-progress">in-progress</NativeSelectOption>
                  <NativeSelectOption value="closed">closed</NativeSelectOption>
                </NativeSelect>
              </label>
            )}
            {onDelete && !confirming && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(true)}>
                Delete
              </Button>
            )}
            {onDelete && confirming && (
              <span className="flex flex-wrap items-center gap-2 text-sm">
                <span>Delete this issue?</span>
                <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(issue._id)}>
                  Yes, delete
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </article>
  );
}
