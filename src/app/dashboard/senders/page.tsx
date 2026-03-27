import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { SenderForm } from "@/features/sender-identities/sender-form";
import { SenderIdentityService } from "@/features/sender-identities/sender-identity-service";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";

export default async function SendersPage() {
  const { workspace } = await resolveWorkspaceMembership();
  const senders = await SenderIdentityService.list(workspace.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Sending Identities"
        title="Senders"
        description="Manage verified sender identities and their DNS verification status."
      />
      <div className="grid gap-8 xl:grid-cols-[0.58fr_0.42fr]">
        <div className="space-y-4">
          {senders.map((sender) => (
            <div className="panel p-5" key={sender.id}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{sender.fromName}</div>
                  <div className="text-sm text-muted-foreground">{sender.fromEmail}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    DKIM {sender.dkimStatus ?? "n/a"} • SPF {sender.spfStatus ?? "n/a"} • DMARC {sender.dmarcStatus ?? "n/a"}
                  </div>
                </div>
                <StatusBadge value={sender.status} />
              </div>
            </div>
          ))}
        </div>
        <SenderForm />
      </div>
    </div>
  );
}
