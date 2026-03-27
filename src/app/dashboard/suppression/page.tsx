import { PageHeader } from "@/components/page-header";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";
import { prisma } from "@/lib/db/prisma";

export default async function SuppressionPage() {
  const { workspace } = await resolveWorkspaceMembership();
  const entries = await prisma.suppressionEntry.findMany({
    where: { workspaceId: workspace.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Safety Controls"
        title="Suppression List"
        description="Suppressed, unsubscribed, complained, and hard-bounced emails are protected from future sends."
      />
      <div className="panel overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Source</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr className="border-t border-border/60" key={entry.id}>
                <td className="px-4 py-3 font-medium">{entry.email}</td>
                <td className="px-4 py-3">{entry.reason}</td>
                <td className="px-4 py-3 text-muted-foreground">{entry.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
