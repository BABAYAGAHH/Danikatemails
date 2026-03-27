import { ReactNode } from "react";
import { compactNumber } from "@/lib/utils/format";

export function MetricCard({
  label,
  value,
  helper,
  icon
}: {
  label: string;
  value: number | string;
  helper?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">{label}</div>
        {icon}
      </div>
      <div className="mt-4 text-3xl font-semibold">
        {typeof value === "number" ? compactNumber(value) : value}
      </div>
      {helper ? <div className="mt-2 text-sm text-muted-foreground">{helper}</div> : null}
    </div>
  );
}
