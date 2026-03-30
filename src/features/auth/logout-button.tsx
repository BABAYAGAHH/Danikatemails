"use client";

import { LogOut } from "lucide-react";
import type { Route } from "next";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getSafeClientRedirectPath } from "@/lib/utils/redirect";

export function LogoutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Button
      disabled={isSubmitting}
      onClick={async () => {
        try {
          setIsSubmitting(true);
          const result = await signOut({
            callbackUrl: "/",
            redirect: false
          });
          router.push(getSafeClientRedirectPath(result.url, "/") as Route);
          router.refresh();
        } finally {
          setIsSubmitting(false);
        }
      }}
      size="sm"
      type="button"
      variant="outline"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isSubmitting ? "Signing out..." : "Sign out"}
    </Button>
  );
}
