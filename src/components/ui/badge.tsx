import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        success: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
        warning: "bg-amber-100 text-amber-900 dark:bg-amber-500/15 dark:text-amber-200",
        destructive: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
        info: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-200"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
