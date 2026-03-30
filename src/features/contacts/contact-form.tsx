"use client";

import {
  ConsentStatus,
  ContactType,
  LawfulBasis,
  OutreachStatus,
  RegionProfile,
  SourceType
} from "@prisma/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema } from "@/lib/validators/schemas";

const contactFormSchema = contactSchema.extend({
  tagsInput: z.string().optional().default("")
});

type ContactPayload = z.infer<typeof contactSchema>;
type FormValues = z.infer<typeof contactFormSchema>;

function buildDefaultValues(initialValues?: Partial<ContactPayload>): FormValues {
  const tags = initialValues?.tags ?? [];

  return {
    companyName: initialValues?.companyName ?? "",
    domain: initialValues?.domain ?? "",
    website: initialValues?.website ?? "",
    country: initialValues?.country ?? "",
    stateRegion: initialValues?.stateRegion ?? "",
    city: initialValues?.city ?? "",
    industry: initialValues?.industry ?? "",
    employeeRange: initialValues?.employeeRange ?? "",
    firstName: initialValues?.firstName ?? "",
    lastName: initialValues?.lastName ?? "",
    jobTitle: initialValues?.jobTitle ?? "",
    email: initialValues?.email ?? "",
    contactType: initialValues?.contactType ?? ContactType.NAMED_BUSINESS_CONTACT,
    sourceType: initialValues?.sourceType ?? SourceType.MANUAL,
    sourceUrl: initialValues?.sourceUrl ?? "",
    sourceNote: initialValues?.sourceNote ?? "",
    lawfulBasis: initialValues?.lawfulBasis ?? LawfulBasis.LEGITIMATE_INTEREST,
    consentStatus: initialValues?.consentStatus ?? ConsentStatus.UNKNOWN,
    outreachStatus: initialValues?.outreachStatus ?? OutreachStatus.ACTIVE,
    regionProfile: initialValues?.regionProfile ?? RegionProfile.OTHER,
    tags,
    tagsInput: tags.join(", ")
  };
}

function toPayload(values: FormValues): ContactPayload {
  const { tagsInput, ...rest } = values;
  const tags = values.tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    ...rest,
    tags
  };
}

export function ContactForm({
  contactId,
  initialValues,
  mode = "create",
  title,
  description
}: {
  contactId?: string;
  initialValues?: Partial<ContactPayload>;
  mode?: "create" | "edit";
  title?: string;
  description?: string;
}) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: buildDefaultValues(initialValues)
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const requestBody = toPayload(values);
      const response = await fetch("/api/contacts", {
        method: mode === "edit" ? "PUT" : "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(mode === "edit" ? { ...requestBody, id: contactId } : requestBody)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create contact");
      }

      return payload.data;
    },
    onSuccess: (_result, values) => {
      toast.success(mode === "edit" ? "Contact updated" : "Contact added");
      form.reset(mode === "edit" ? values : buildDefaultValues());
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title ?? (mode === "edit" ? "Edit Contact" : "Add Contact")}</CardTitle>
        <CardDescription>
          {description ??
            (mode === "edit"
              ? "Update contact details, source records, and compliance metadata for this workspace."
              : "Manually add a public business contact with source and lawful-basis fields.")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <div className="grid gap-2">
            <Label htmlFor="companyName">Company</Label>
            <Input id="companyName" {...form.register("companyName")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...form.register("email")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="domain">Company domain</Label>
            <Input id="domain" {...form.register("domain")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="website">Website</Label>
            <Input id="website" {...form.register("website")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" {...form.register("firstName")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" {...form.register("lastName")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="jobTitle">Job title</Label>
            <Input id="jobTitle" {...form.register("jobTitle")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" {...form.register("industry")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...form.register("country")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stateRegion">State or region</Label>
            <Input id="stateRegion" {...form.register("stateRegion")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...form.register("city")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="employeeRange">Employee range</Label>
            <Input id="employeeRange" {...form.register("employeeRange")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="contactType">Contact type</Label>
            <Select id="contactType" {...form.register("contactType")}>
              <option value={ContactType.NAMED_BUSINESS_CONTACT}>Named business contact</option>
              <option value={ContactType.ROLE_INBOX}>Role inbox</option>
              <option value={ContactType.GENERIC_INBOX}>Generic inbox</option>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sourceType">Source type</Label>
            <Select id="sourceType" {...form.register("sourceType")}>
              <option value={SourceType.MANUAL}>Manual</option>
              <option value={SourceType.CSV_IMPORT}>CSV import</option>
              <option value={SourceType.PUBLIC_WEBSITE}>Public website</option>
              <option value={SourceType.REFERRAL}>Referral</option>
              <option value={SourceType.API}>API</option>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="lawfulBasis">Lawful basis</Label>
            <Select id="lawfulBasis" {...form.register("lawfulBasis")}>
              <option value={LawfulBasis.CONSENT}>Consent</option>
              <option value={LawfulBasis.LEGITIMATE_INTEREST}>Legitimate interest</option>
              <option value={LawfulBasis.EXISTING_CUSTOMER}>Existing customer</option>
              <option value={LawfulBasis.NOT_SET}>Not set</option>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="consentStatus">Consent status</Label>
            <Select id="consentStatus" {...form.register("consentStatus")}>
              <option value={ConsentStatus.GRANTED}>Granted</option>
              <option value={ConsentStatus.UNKNOWN}>Unknown</option>
              <option value={ConsentStatus.DENIED}>Denied</option>
              <option value={ConsentStatus.OBJECTED}>Objected</option>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="outreachStatus">Outreach status</Label>
            <Select id="outreachStatus" {...form.register("outreachStatus")}>
              <option value={OutreachStatus.ACTIVE}>Active</option>
              <option value={OutreachStatus.UNSUBSCRIBED}>Unsubscribed</option>
              <option value={OutreachStatus.SUPPRESSED}>Suppressed</option>
              <option value={OutreachStatus.BOUNCED_HARD}>Bounced hard</option>
              <option value={OutreachStatus.COMPLAINED}>Complained</option>
              <option value={OutreachStatus.INVALID}>Invalid</option>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="regionProfile">Region profile</Label>
            <Select id="regionProfile" {...form.register("regionProfile")}>
              <option value={RegionProfile.US}>US</option>
              <option value={RegionProfile.UK}>UK</option>
              <option value={RegionProfile.EU}>EU</option>
              <option value={RegionProfile.OTHER}>Other</option>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="sourceUrl">Source URL</Label>
            <Input id="sourceUrl" {...form.register("sourceUrl")} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="sourceNote">Source note</Label>
            <Textarea id="sourceNote" rows={3} {...form.register("sourceNote")} />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="tagsInput">Tags</Label>
            <Input
              id="tagsInput"
              placeholder="finance, west-coast, q2"
              {...form.register("tagsInput")}
            />
          </div>
          <div className="md:col-span-2">
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending
                ? mode === "edit"
                  ? "Saving changes..."
                  : "Saving..."
                : mode === "edit"
                  ? "Save changes"
                  : "Add contact"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
