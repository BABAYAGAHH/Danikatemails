import { PageHeader } from "@/components/page-header";
import { AuditService } from "@/features/audit/audit-service";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";
import { formatRelative } from "@/lib/utils/format";

export default async function AuditPage() {
  const { workspace } = await resolveWorkspaceMembership();
  const logs = await AuditService.list(workspace.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Audit Trail"
        title="Audit Logs"
        description="Every critical compliance, campaign, contact, and sender action is captured here."
      />
      <div className="panel overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Actor</th>
              <th className="px-4 py-3">When</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr className="border-t border-border/60" key={log.id}>
                <td className="px-4 py-3 font-medium">{log.action}</td>
                <td className="px-4 py-3">{log.entityType}:{log.entityId}</td>
                <td className="px-4 py-3">{log.actorUser?.email ?? "System"}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatRelative(log.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
