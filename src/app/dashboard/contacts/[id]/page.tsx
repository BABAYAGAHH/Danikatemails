import { UserRole } from "@prisma/client";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { DeleteContactButton } from "@/features/contacts/delete-contact-button";
import { ContactForm } from "@/features/contacts/contact-form";
import { ContactService } from "@/features/contacts/contact-service";
import { hasAnyRole } from "@/lib/auth/permissions";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";
import { formatRelative } from "@/lib/utils/format";

export default async function ContactDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { workspace, membership } = await resolveWorkspaceMembership();
  const { id } = await params;
  const contact = await ContactService.getById(workspace.id, id);

  if (!contact) {
    notFound();
  }

  const canEditContact = hasAnyRole(membership.role, [
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.MARKETER
  ]);
  const canDeleteContact = hasAnyRole(membership.role, [UserRole.OWNER, UserRole.ADMIN]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Contact Profile"
        title={contact.fullName || contact.email}
        description={
          contact.company
            ? `${contact.company.name} - ${contact.jobTitle ?? "Business contact"}`
            : contact.email
        }
      />

      <div className="grid gap-6 xl:grid-cols-[0.44fr_0.56fr]">
        <div className="space-y-6">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Profile</h2>
              {canDeleteContact ? (
                <DeleteContactButton
                  contactId={contact.id}
                  contactName={contact.fullName || contact.email}
                />
              ) : null}
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="mt-1 font-medium">{contact.email}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Company</dt>
                <dd className="mt-1 font-medium">{contact.company?.name ?? "No company linked"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Region profile</dt>
                <dd className="mt-1">
                  <StatusBadge value={contact.regionProfile} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Lawful basis</dt>
                <dd className="mt-1">
                  <StatusBadge value={contact.lawfulBasis} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Outreach status</dt>
                <dd className="mt-1">
                  <StatusBadge value={contact.outreachStatus} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Last contacted</dt>
                <dd className="mt-1">{formatRelative(contact.lastContactedAt)}</dd>
              </div>
            </dl>
          </div>

          {canEditContact ? (
            <ContactForm
              contactId={contact.id}
              description="Update company, source, and compliance fields for this contact."
              initialValues={{
                companyName: contact.company?.name ?? "",
                domain: contact.company?.domain ?? "",
                website: contact.company?.website ?? "",
                country: contact.company?.country ?? "",
                stateRegion: contact.company?.region ?? "",
                city: contact.company?.city ?? "",
                industry: contact.company?.industry ?? "",
                employeeRange: contact.company?.employeeRange ?? "",
                firstName: contact.firstName ?? "",
                lastName: contact.lastName ?? "",
                jobTitle: contact.jobTitle ?? "",
                email: contact.email,
                contactType: contact.contactType,
                sourceType: contact.sourceType,
                sourceUrl: contact.sourceUrl ?? "",
                sourceNote: contact.sourceNote ?? "",
                lawfulBasis: contact.lawfulBasis,
                consentStatus: contact.consentStatus,
                outreachStatus: contact.outreachStatus,
                regionProfile: contact.regionProfile,
                tags: contact.tags
              }}
              mode="edit"
              title="Edit contact"
            />
          ) : (
            <div className="panel p-6 text-sm text-muted-foreground">
              This workspace role can review contact history, but editing is limited to owners,
              admins, and marketers.
            </div>
          )}
        </div>

        <div className="panel p-6">
          <h2 className="text-lg font-semibold">Activity timeline</h2>
          <div className="mt-5 space-y-3">
            {contact.emailEvents.length ? (
              contact.emailEvents.map((event) => (
                <div className="rounded-2xl border border-border/70 px-4 py-3" key={event.id}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium">
                      {event.eventType.replace(/_/g, " ").toLowerCase()}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatRelative(event.occurredAt)}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {event.providerEventId ?? "No provider event id"}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border/80 px-4 py-8 text-sm text-muted-foreground">
                No email activity recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
