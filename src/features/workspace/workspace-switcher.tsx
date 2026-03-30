"use client";

import { UserRole } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export function WorkspaceSwitcher({
  currentWorkspaceId,
  workspaces
}: {
  currentWorkspaceId: string;
  workspaces: Array<{
    workspaceId: string;
    name: string;
    slug: string;
    role: UserRole;
  }>;
}) {
  const router = useRouter();
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(currentWorkspaceId);

  useEffect(() => {
    setSelectedWorkspaceId(currentWorkspaceId);
  }, [currentWorkspaceId]);

  const mutation = useMutation({
    mutationFn: async (workspaceId: string) => {
      const response = await fetch("/api/workspaces/active", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ workspaceId })
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to switch workspace");
      }

      return payload.data;
    },
    onSuccess: () => {
      toast.success("Workspace switched");
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
      setSelectedWorkspaceId(currentWorkspaceId);
    }
  });

  if (workspaces.length <= 1) {
    return null;
  }

  return (
    <div className="mb-6 space-y-2 rounded-2xl border border-border/70 bg-background/70 p-3">
      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Workspace</div>
      <div className="flex items-center gap-2">
        <Select
          disabled={mutation.isPending}
          onChange={(event) => setSelectedWorkspaceId(event.target.value)}
          value={selectedWorkspaceId}
        >
          {workspaces.map((workspace) => (
            <option key={workspace.workspaceId} value={workspace.workspaceId}>
              {workspace.name} ({workspace.role})
            </option>
          ))}
        </Select>
        <Button
          disabled={mutation.isPending || selectedWorkspaceId === currentWorkspaceId}
          onClick={() => mutation.mutate(selectedWorkspaceId)}
          size="sm"
          type="button"
          variant="secondary"
        >
          {mutation.isPending ? "Switching..." : "Switch"}
        </Button>
      </div>
      <div className="truncate text-xs text-muted-foreground">
        {workspaces.find((workspace) => workspace.workspaceId === selectedWorkspaceId)?.slug}
      </div>
    </div>
  );
}
