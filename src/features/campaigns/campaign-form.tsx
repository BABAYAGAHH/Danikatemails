"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { campaignSchema } from "@/lib/validators/schemas";

type FormValues = z.infer<typeof campaignSchema>;

export function CampaignForm({
  senders,
  templates,
  segments,
  workspaceAddress
}: {
  senders: Array<{ id: string; fromName: string; fromEmail: string }>;
  templates: Array<{ id: string; name: string }>;
  segments: Array<{ id: string; name: string }>;
  workspaceAddress: string;
}) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      name: "",
      senderIdentityId: senders[0]?.id ?? "",
      templateId: templates[0]?.id ?? "",
      segmentId: segments[0]?.id ?? "",
      subjectOverride: "",
      previewTextOverride: "",
      htmlFooter: `<p>${workspaceAddress}</p><p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>`,
      textFooter: `${workspaceAddress}\nUnsubscribe: {{unsubscribeUrl}}`,
      scheduledAt: "",
      maxPerMinute: 20,
      maxPerHour: 200,
      maxPerDay: 1000
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          ...values,
          scheduledAt: values.scheduledAt ? new Date(values.scheduledAt).toISOString() : ""
        })
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create campaign");
      }
      return payload.data;
    },
    onSuccess: (campaign) => {
      toast.success("Campaign drafted");
      router.push(`/dashboard/campaigns/${campaign.id}`);
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaign Wizard</CardTitle>
        <CardDescription>
          Draft a compliant campaign with sender identity, segment, template, footer, and throttle rules.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="campaign-name">Campaign name</Label>
              <Input id="campaign-name" {...form.register("name")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="campaign-sender">Sender identity</Label>
              <Select id="campaign-sender" {...form.register("senderIdentityId")}>
                {senders.map((sender) => (
                  <option key={sender.id} value={sender.id}>
                    {sender.fromName} ({sender.fromEmail})
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="campaign-template">Template</Label>
              <Select id="campaign-template" {...form.register("templateId")}>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="campaign-segment">Segment</Label>
              <Select id="campaign-segment" {...form.register("segmentId")}>
                <option value="">All contacts</option>
                {segments.map((segment) => (
                  <option key={segment.id} value={segment.id}>
                    {segment.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="subjectOverride">Subject override</Label>
              <Input id="subjectOverride" {...form.register("subjectOverride")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="previewTextOverride">Preview text override</Label>
              <Input id="previewTextOverride" {...form.register("previewTextOverride")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="maxPerMinute">Max per minute</Label>
              <Input
                id="maxPerMinute"
                type="number"
                {...form.register("maxPerMinute", { valueAsNumber: true })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxPerHour">Max per hour</Label>
              <Input id="maxPerHour" type="number" {...form.register("maxPerHour", { valueAsNumber: true })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxPerDay">Max per day</Label>
              <Input id="maxPerDay" type="number" {...form.register("maxPerDay", { valueAsNumber: true })} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="scheduledAt">Schedule for later</Label>
            <Input id="scheduledAt" type="datetime-local" {...form.register("scheduledAt")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="htmlFooter">HTML footer</Label>
            <Textarea id="htmlFooter" className="min-h-[140px]" {...form.register("htmlFooter")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="textFooter">Text footer</Label>
            <Textarea id="textFooter" className="min-h-[120px]" {...form.register("textFooter")} />
          </div>

          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Saving..." : "Create campaign"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
