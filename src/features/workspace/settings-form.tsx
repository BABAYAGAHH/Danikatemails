"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { workspaceSettingsSchema } from "@/lib/validators/schemas";

type FormValues = z.infer<typeof workspaceSettingsSchema>;

export function SettingsForm({ initialValues }: { initialValues: FormValues }) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(workspaceSettingsSchema),
    defaultValues: initialValues
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/workspaces", {
        method: "PATCH",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(values)
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to update settings");
      }
      return payload.data;
    },
    onSuccess: () => {
      toast.success("Workspace settings updated");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Defaults</CardTitle>
        <CardDescription>These defaults drive campaign launch checks and workspace-wide behavior.</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="grid gap-2">
            <Label htmlFor="settings-postal">Physical postal address</Label>
            <Textarea id="settings-postal" {...form.register("physicalPostalAddress")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="settings-region">Default region profile</Label>
            <Select id="settings-region" {...form.register("defaultRegionProfile")}>
              <option value="US">US</option>
              <option value="UK">UK</option>
              <option value="EU">EU</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm">
            <input className="h-4 w-4" type="checkbox" {...form.register("requireLawfulBasisBeforeSend")} />
            Block campaigns when lawful basis is not set
          </label>

          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Saving..." : "Save settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
