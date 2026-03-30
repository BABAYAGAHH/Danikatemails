import { UserRole } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/features/contacts/contact-form";
import { ContactsTable } from "@/features/contacts/contacts-table";
import { ContactService } from "@/features/contacts/contact-service";
import { hasAnyRole } from "@/lib/auth/permissions";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";

export default async function ContactsPage() {
  const { workspace, membership } = await resolveWorkspaceMembership();
  const contacts = await ContactService.list(workspace.id);
  const canManageContacts = hasAnyRole(membership.role, [
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.MARKETER
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Lead Database"
        title="Contacts"
        description="Manage public business contacts, lawful basis, outreach status, and segmentation fields."
      />

      <div className="grid gap-8 xl:grid-cols-[0.68fr_0.32fr]">
        <ContactsTable
          data={contacts.map((contact) => ({
            id: contact.id,
            fullName: contact.fullName,
            email: contact.email,
            companyName: contact.company?.name ?? "No company",
            industry: contact.company?.industry ?? "Unknown",
            regionProfile: contact.regionProfile,
            lawfulBasis: contact.lawfulBasis,
            outreachStatus: contact.outreachStatus
          }))}
        />
        {canManageContacts ? (
          <ContactForm />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Read-only access</CardTitle>
              <CardDescription>
                Viewers can review contacts, but only owners, admins, and marketers can add or edit them.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Contact records stay protected by workspace role checks at both the UI and API layers.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
