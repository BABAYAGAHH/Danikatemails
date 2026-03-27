import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { TemplateForm } from "@/features/templates/template-form";
import { TemplateService } from "@/features/templates/template-service";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";

export default async function TemplatesPage() {
  const { workspace } = await resolveWorkspaceMembership();
  const templates = await TemplateService.list(workspace.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Messaging Library"
        title="Templates"
        description="Version and preview compliant email content with reusable personalization tokens."
      />
      <div className="grid gap-8 xl:grid-cols-[0.58fr_0.42fr]">
        <div className="space-y-4">
          {templates.map((template) => (
            <Link className="panel block p-5 transition hover:border-primary/40" href={`/dashboard/templates/${template.id}`} key={template.id}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{template.name}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{template.subject}</div>
                </div>
                <StatusBadge value={template.status} />
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                Versions: {template.versions.length}
              </div>
            </Link>
          ))}
        </div>
        <TemplateForm />
      </div>
    </div>
  );
}
