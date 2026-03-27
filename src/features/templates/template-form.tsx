"use client";

import { TemplateStatus } from "@prisma/client";
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
import { templateSchema } from "@/lib/validators/schemas";

type FormValues = z.infer<typeof templateSchema>;

export function TemplateForm({
  initialValues,
  templateId
}: {
  initialValues?: Partial<FormValues>;
  templateId?: string;
}) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      subject: initialValues?.subject ?? "",
      previewText: initialValues?.previewText ?? "",
      htmlContent: initialValues?.htmlContent ?? "<p>Hi {{firstName}},</p><p></p><p><a href='{{unsubscribeUrl}}'>Unsubscribe</a></p>",
      textContent: initialValues?.textContent ?? "Hi {{firstName}},\n\n\n\nUnsubscribe: {{unsubscribeUrl}}",
      status: initialValues?.status ?? TemplateStatus.DRAFT
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch(templateId ? `/api/templates/${templateId}` : "/api/templates", {
        method: templateId ? "PUT" : "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to save template");
      }

      return payload.data;
    },
    onSuccess: () => {
      toast.success(templateId ? "Template updated" : "Template created");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{templateId ? "Edit Template" : "Create Template"}</CardTitle>
        <CardDescription>
          Build paired HTML and text templates with reusable personalization tokens.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="template-name">Name</Label>
              <Input id="template-name" {...form.register("name")} />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="template-subject">Subject</Label>
              <Input id="template-subject" {...form.register("subject")} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="template-preview">Preview text</Label>
            <Input id="template-preview" {...form.register("previewText")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="template-status">Status</Label>
            <Select id="template-status" {...form.register("status")}>
              <option value={TemplateStatus.DRAFT}>Draft</option>
              <option value={TemplateStatus.ACTIVE}>Active</option>
              <option value={TemplateStatus.ARCHIVED}>Archived</option>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="template-html">HTML content</Label>
            <Textarea id="template-html" className="min-h-[220px]" {...form.register("htmlContent")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="template-text">Text content</Label>
            <Textarea id="template-text" className="min-h-[220px]" {...form.register("textContent")} />
          </div>
          <Button disabled={mutation.isPending} type="submit">
            {mutation.isPending ? "Saving..." : templateId ? "Update template" : "Create template"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
