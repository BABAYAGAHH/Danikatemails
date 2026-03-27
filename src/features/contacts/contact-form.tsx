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
import { contactSchema } from "@/lib/validators/schemas";

type FormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      companyName: "",
      domain: "",
      website: "",
      country: "",
      stateRegion: "",
      city: "",
      industry: "",
      employeeRange: "",
      firstName: "",
      lastName: "",
      jobTitle: "",
      email: "",
      contactType: ContactType.NAMED_BUSINESS_CONTACT,
      sourceType: SourceType.MANUAL,
      sourceUrl: "",
      sourceNote: "",
      lawfulBasis: LawfulBasis.LEGITIMATE_INTEREST,
      consentStatus: ConsentStatus.UNKNOWN,
      outreachStatus: OutreachStatus.ACTIVE,
      regionProfile: RegionProfile.OTHER,
      tags: []
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to create contact");
      }

      return payload.data;
    },
    onSuccess: () => {
      toast.success("Contact added");
      form.reset();
      router.refresh();
    },
    onError: (error: Error) => toast.error(error.message)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Contact</CardTitle>
        <CardDescription>
          Manually add a public business contact with source and lawful-basis fields.
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
            <Label htmlFor="lawfulBasis">Lawful basis</Label>
            <Select id="lawfulBasis" {...form.register("lawfulBasis")}>
              <option value={LawfulBasis.CONSENT}>Consent</option>
              <option value={LawfulBasis.LEGITIMATE_INTEREST}>Legitimate interest</option>
              <option value={LawfulBasis.EXISTING_CUSTOMER}>Existing customer</option>
              <option value={LawfulBasis.NOT_SET}>Not set</option>
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
          <div className="md:col-span-2">
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending ? "Saving..." : "Add contact"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
