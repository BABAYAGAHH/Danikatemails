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
import { senderIdentitySchema } from "@/lib/validators/schemas";

type FormValues = z.infer<typeof senderIdentitySchema>;

export function SenderForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(senderIdentitySchema),
    defaultValues: {
      fromName: "",
      fromEmail: "",
      replyToEmail: "",
      domain: "",
      provider: "mock"
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/senders", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(values)
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to add sender identity");
      }
      return payload.data;
    },
    onSuccess: () => {
      toast.success("Sender identity added");
      form.reset();
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Sender Identity</CardTitle>
        <CardDescription>
          Sender identities must be verified before campaigns can launch.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="grid gap-2">
            <Label htmlFor="fromName">From name</Label>
            <Input id="fromName" {...form.register("fromName")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fromEmail">From email</Label>
            <Input id="fromEmail" {...form.register("fromEmail")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="replyToEmail">Reply-to</Label>
            <Input id="replyToEmail" {...form.register("replyToEmail")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="domain">Domain</Label>
            <Input id="domain" {...form.register("domain")} />
          </div>
          <div className="md:col-span-2">
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending ? "Saving..." : "Add sender"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
