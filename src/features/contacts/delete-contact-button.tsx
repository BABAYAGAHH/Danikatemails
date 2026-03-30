"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteContactButton({
  contactId,
  contactName
}: {
  contactId: string;
  contactName: string;
}) {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/contacts?id=${encodeURIComponent(contactId)}`, {
        method: "DELETE"
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to delete contact");
      }

      return payload.data;
    },
    onSuccess: () => {
      toast.success("Contact deleted");
      router.push("/dashboard/contacts");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return (
    <Button
      disabled={mutation.isPending}
      onClick={() => {
        if (window.confirm(`Delete ${contactName}? This action cannot be undone.`)) {
          mutation.mutate();
        }
      }}
      type="button"
      variant="destructive"
    >
      {mutation.isPending ? "Deleting..." : "Delete contact"}
    </Button>
  );
}
