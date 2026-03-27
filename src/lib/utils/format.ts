import { formatDistanceToNowStrict } from "date-fns";

export function formatRate(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export function formatRelative(date: Date | string | null | undefined) {
  if (!date) {
    return "Never";
  }

  const parsed = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNowStrict(parsed, { addSuffix: true });
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}
