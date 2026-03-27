import { PageHeader } from "@/components/page-header";
import { ContactForm } from "@/features/contacts/contact-form";
import { ContactsTable } from "@/features/contacts/contacts-table";
import { ContactService } from "@/features/contacts/contact-service";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";

export default async function ContactsPage() {
  const { workspace } = await resolveWorkspaceMembership();
  const contacts = await ContactService.list(workspace.id);

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
        <ContactForm />
      </div>
    </div>
  );
}
