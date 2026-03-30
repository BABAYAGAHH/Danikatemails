"use client";

import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function ThemeToggle({
  className,
  showLabel = true
}: {
  className?: string;
  showLabel?: boolean;
}) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      className={cn(showLabel ? undefined : "shrink-0", className)}
      variant="ghost"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      size={showLabel ? "sm" : "icon"}
      type="button"
    >
      {resolvedTheme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
      {showLabel ? <span className="ml-2">{resolvedTheme === "dark" ? "Light" : "Dark"}</span> : null}
      {!showLabel ? <span className="sr-only">Toggle theme</span> : null}
    </Button>
  );
}
