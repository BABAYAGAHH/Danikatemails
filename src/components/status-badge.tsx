import { Badge } from "@/components/ui/badge";

const destructiveStates = new Set([
  "FAILED",
  "CANCELLED",
  "SUPPRESSED",
  "UNSUBSCRIBED",
  "COMPLAINED",
  "BOUNCED_HARD",
  "INVALID"
]);

const warningStates = new Set(["PENDING", "PAUSED", "DRAFT", "UNKNOWN", "NOT_SET"]);
const successStates = new Set(["VERIFIED", "ACTIVE", "RUNNING", "COMPLETED", "DELIVERED", "SENT", "GRANTED"]);

export function StatusBadge({ value }: { value: string }) {
  const normalized = value.toUpperCase();

  const variant = destructiveStates.has(normalized)
    ? "destructive"
    : successStates.has(normalized)
      ? "success"
      : warningStates.has(normalized)
        ? "warning"
        : "info";

  return <Badge variant={variant}>{value.replace(/_/g, " ").toLowerCase()}</Badge>;
}
