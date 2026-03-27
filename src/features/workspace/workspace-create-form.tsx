"use client";

import { RegionProfile } from "@prisma/client";
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
import { workspaceCreateSchema } from "@/lib/validators/schemas";

type FormValues = z.infer<typeof workspaceCreateSchema>;

export function WorkspaceCreateForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(workspaceCreateSchema),
    defaultValues: {
      name: "",
      slug: "",
      physicalPostalAddress: "",
      requireLawfulBasisBeforeSend: true,
      defaultRegionProfile: RegionProfile.OTHER
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create workspace");
      }

      return payload.data;
    },
    onSuccess: () => {
      toast.success("Workspace created");
      router.push("/dashboard");
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Create Workspace</CardTitle>
        <CardDescription>
          RegionReach uses workspaces to isolate contacts, campaigns, sender identities, and audit data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-5"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="grid gap-2">
            <Label htmlFor="name">Workspace name</Label>
            <Input id="name" {...form.register("name")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="slug">Workspace slug</Label>
            <Input id="slug" {...form.register("slug")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="physicalPostalAddress">Postal address</Label>
            <Textarea id="physicalPostalAddress" {...form.register("physicalPostalAddress")} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="defaultRegionProfile">Default region profile</Label>
            <Select id="defaultRegionProfile" {...form.register("defaultRegionProfile")}>
              <option value={RegionProfile.US}>US</option>
              <option value={RegionProfile.UK}>UK</option>
              <option value={RegionProfile.EU}>EU</option>
              <option value={RegionProfile.OTHER}>Other</option>
            </Select>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm">
            <input className="h-4 w-4" type="checkbox" {...form.register("requireLawfulBasisBeforeSend")} />
            Require lawful basis before campaign launch
          </label>

          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Creating..." : "Create workspace"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
