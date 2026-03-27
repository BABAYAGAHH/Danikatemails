"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

async function postAction(path: string) {
  const response = await fetch(path, { method: "POST" });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error ?? "Action failed");
  }
  return payload.data;
}

export function CampaignActionButtons({
  campaignId,
  status
}: {
  campaignId: string;
  status: string;
}) {
  const router = useRouter();

  const launch = useMutation({
    mutationFn: () => postAction(`/api/campaigns/${campaignId}/launch`),
    onSuccess: () => {
      toast.success("Campaign launched");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const pause = useMutation({
    mutationFn: () => postAction(`/api/campaigns/${campaignId}/pause`),
    onSuccess: () => {
      toast.success("Campaign paused");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const cancel = useMutation({
    mutationFn: () => postAction(`/api/campaigns/${campaignId}/cancel`),
    onSuccess: () => {
      toast.success("Campaign cancelled");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message)
  });

  return (
    <div className="flex flex-wrap gap-3">
      {status === "DRAFT" ? (
        <Button disabled={launch.isPending} onClick={() => launch.mutate()} type="button">
          {launch.isPending ? "Launching..." : "Launch campaign"}
        </Button>
      ) : null}
      {status === "RUNNING" || status === "SCHEDULED" ? (
        <Button disabled={pause.isPending} onClick={() => pause.mutate()} type="button" variant="secondary">
          {pause.isPending ? "Pausing..." : "Pause"}
        </Button>
      ) : null}
      {status !== "COMPLETED" && status !== "CANCELLED" ? (
        <Button disabled={cancel.isPending} onClick={() => cancel.mutate()} type="button" variant="destructive">
          {cancel.isPending ? "Cancelling..." : "Cancel"}
        </Button>
      ) : null}
    </div>
  );
}
