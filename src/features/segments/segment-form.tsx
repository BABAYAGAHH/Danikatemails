"use client";

import { OutreachStatus, RegionProfile } from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { segmentSchema } from "@/lib/validators/schemas";

type FormValues = z.infer<typeof segmentSchema>;

export function SegmentForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(segmentSchema),
    defaultValues: {
      name: "",
      filterJson: {
        regionProfile: [RegionProfile.OTHER],
        outreachStatuses: [OutreachStatus.ACTIVE]
      }
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/segments", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(values)
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create segment");
      }
      return payload.data;
    },
    onSuccess: () => {
      toast.success("Segment saved");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Segment</CardTitle>
        <CardDescription>Define reusable filters for campaigns and reporting.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-3"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="grid gap-2">
            <Label htmlFor="segment-name">Name</Label>
            <Input id="segment-name" {...form.register("name")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="segment-region">Region profile</Label>
            <Select
              defaultValue={RegionProfile.OTHER}
              id="segment-region"
              onChange={(event) =>
                form.setValue("filterJson.regionProfile", [event.target.value as RegionProfile])
              }
            >
              <option value={RegionProfile.US}>US</option>
              <option value={RegionProfile.UK}>UK</option>
              <option value={RegionProfile.EU}>EU</option>
              <option value={RegionProfile.OTHER}>Other</option>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="segment-status">Outreach status</Label>
            <Select
              defaultValue={OutreachStatus.ACTIVE}
              id="segment-status"
              onChange={(event) =>
                form.setValue("filterJson.outreachStatuses", [event.target.value as OutreachStatus])
              }
            >
              <option value={OutreachStatus.ACTIVE}>Active</option>
              <option value={OutreachStatus.SUPPRESSED}>Suppressed</option>
              <option value={OutreachStatus.UNSUBSCRIBED}>Unsubscribed</option>
            </Select>
          </div>
          <div className="md:col-span-3">
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending ? "Saving..." : "Create segment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
