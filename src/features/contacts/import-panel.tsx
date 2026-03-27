"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type PreviewResponse = {
  detectedColumns: string[];
  inferredMapping: Record<string, string>;
  previewRows: Array<Record<string, string>>;
  totalRows: number;
};

const fields = [
  { key: "companyName", label: "Company name" },
  { key: "email", label: "Email" },
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "jobTitle", label: "Job title" },
  { key: "industry", label: "Industry" },
  { key: "country", label: "Country" },
  { key: "stateRegion", label: "State / region" },
  { key: "city", label: "City" },
  { key: "domain", label: "Domain" }
];

export function ImportPanel() {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const previewMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/contacts/import", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          fileName,
          csvContent,
          preview: true
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Preview failed");
      }
      return payload.data as PreviewResponse;
    },
    onSuccess: (data) => {
      setPreview(data);
      setMapping(data.inferredMapping);
      toast.success("Preview ready");
    },
    onError: (error: Error) => toast.error(error.message)
  });

  const importMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/contacts/import", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          fileName,
          csvContent,
          preview: false,
          mapping
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? "Import failed");
      }
      return payload.data;
    },
    onSuccess: () => {
      toast.success("CSV imported");
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>CSV Importer</CardTitle>
        <CardDescription>
          Upload a CSV, review detected columns, and confirm the field mapping before records are created.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="csv-file">CSV file</Label>
          <Input
            id="csv-file"
            accept=".csv,text/csv"
            type="file"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setFileName(file.name);
              setCsvContent(await file.text());
            }}
          />
        </div>

        <Button disabled={!csvContent || previewMutation.isPending} onClick={() => previewMutation.mutate()} type="button">
          {previewMutation.isPending ? "Analyzing..." : "Preview mapping"}
        </Button>

        {preview ? (
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <div className="grid gap-2" key={field.key}>
                  <Label>{field.label}</Label>
                  <Select
                    value={mapping[field.key] ?? ""}
                    onChange={(event) =>
                      setMapping((current) => ({
                        ...current,
                        [field.key]: event.target.value
                      }))
                    }
                  >
                    <option value="">Ignore column</option>
                    {preview.detectedColumns.map((column) => (
                      <option key={column} value={column}>
                        {column}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
              Previewing {preview.totalRows} rows. The first {preview.previewRows.length} rows are shown below.
            </div>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-muted/60">
                  <tr>
                    {preview.detectedColumns.map((column) => (
                      <th className="px-3 py-2" key={column}>
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.previewRows.map((row, index) => (
                    <tr className="border-t border-border/60" key={index}>
                      {preview.detectedColumns.map((column) => (
                        <td className="px-3 py-2" key={column}>
                          {row[column] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button disabled={importMutation.isPending} onClick={() => importMutation.mutate()} type="button">
              {importMutation.isPending ? "Importing..." : "Import contacts"}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
