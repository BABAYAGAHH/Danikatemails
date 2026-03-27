import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { TemplateForm } from "@/features/templates/template-form";
import { TemplateService } from "@/features/templates/template-service";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";

export default async function TemplateDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { workspace } = await resolveWorkspaceMembership();
  const { id } = await params;
  const template = await TemplateService.getById(workspace.id, id);

  if (!template) {
    notFound();
  }

  const preview = await TemplateService.preview(template.id, workspace.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Template Detail"
        title={template.name}
        description="Edit content, inspect version history, and preview token rendering."
      />

      <div className="grid gap-8 xl:grid-cols-[0.58fr_0.42fr]">
        <TemplateForm
          initialValues={{
            name: template.name,
            subject: template.subject,
            previewText: template.previewText ?? "",
            htmlContent: template.htmlContent,
            textContent: template.textContent,
            status: template.status
          }}
          templateId={template.id}
        />

        <div className="space-y-6">
          <div className="panel p-6">
            <h2 className="text-lg font-semibold">Preview</h2>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Subject</div>
                <div className="mt-1 font-medium">{preview.subject}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <div dangerouslySetInnerHTML={{ __html: preview.html }} />
              </div>
            </div>
          </div>

          <div className="panel p-6">
            <h2 className="text-lg font-semibold">Version history</h2>
            <div className="mt-4 space-y-3">
              {template.versions.map((version) => (
                <div className="rounded-2xl border border-border/70 px-4 py-3" key={version.id}>
                  <div className="font-medium">Version {version.versionNumber}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{version.subject}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
