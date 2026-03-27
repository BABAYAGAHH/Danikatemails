import { PageHeader } from "@/components/page-header";
import { ImportPanel } from "@/features/contacts/import-panel";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";
import { prisma } from "@/lib/db/prisma";

export default async function ImportsPage() {
  const { workspace } = await resolveWorkspaceMembership();
  const imports = await prisma.contactImport.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Data Intake"
        title="Imports"
        description="Preview CSV mappings, validate rows, and track import summaries with duplicates and skips."
      />

      <div className="grid gap-8 xl:grid-cols-[0.62fr_0.38fr]">
        <div className="panel overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/60 text-left">
              <tr>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Imported</th>
                <th className="px-4 py-3">Duplicates</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {imports.map((item) => (
                <tr className="border-t border-border/60" key={item.id}>
                  <td className="px-4 py-3 font-medium">{item.fileName}</td>
                  <td className="px-4 py-3">{item.importedRows}/{item.totalRows}</td>
                  <td className="px-4 py-3">{item.duplicateRows}</td>
                  <td className="px-4 py-3">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ImportPanel />
      </div>
    </div>
  );
}
