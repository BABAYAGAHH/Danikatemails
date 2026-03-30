"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <Button
      disabled={isSubmitting}
      onClick={async () => {
        try {
          setIsSubmitting(true);
          await signOut({
            callbackUrl: "/"
          });
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
