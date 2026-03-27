import {
  CampaignStatus,
  ConsentStatus,
  ContactType,
  EmailEventType,
  LawfulBasis,
  OutreachStatus,
  PrismaClient,
  RegionProfile,
  SenderStatus,
  SourceType,
  TemplateStatus,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient();

const workspaceId = "ws_demo_regionreach";
const ownerUserId = "user_demo_owner";
const senderId = "sender_demo_primary";

const companySeed = [
  ["Northwind Systems", "northwind.io", "Technology", "51-200", "United States", "California", "San Francisco", RegionProfile.US],
  ["Lakeshore Logistics", "lakeshorelogistics.com", "Logistics", "201-500", "United States", "Illinois", "Chicago", RegionProfile.US],
  ["HarborWorks Manufacturing", "harborworks.co", "Manufacturing", "501-1000", "United Kingdom", "England", "Liverpool", RegionProfile.UK],
  ["BluePeak Advisors", "bluepeakadvisors.com", "Financial Services", "11-50", "United Kingdom", "Scotland", "Edinburgh", RegionProfile.UK],
  ["Mercury BioLabs", "mercurybiolabs.eu", "Biotech", "51-200", "Germany", "Berlin", "Berlin", RegionProfile.EU],
  ["Alpine Renewables", "alpinerenewables.eu", "Energy", "201-500", "Germany", "Bavaria", "Munich", RegionProfile.EU],
  ["Vertex Retail Group", "vertexretail.com", "Retail", "1001-5000", "United States", "Texas", "Austin", RegionProfile.US],
  ["Prairie Health Partners", "prairiehealth.com", "Healthcare", "501-1000", "United States", "Colorado", "Denver", RegionProfile.US],
  ["Crestline Security", "crestlinesecurity.co.uk", "Cybersecurity", "51-200", "United Kingdom", "England", "London", RegionProfile.UK],
  ["Atlas Procurement", "atlasprocure.com", "Procurement", "11-50", "Netherlands", "North Holland", "Amsterdam", RegionProfile.EU],
  ["Helio Food Group", "heliofood.com", "Food & Beverage", "201-500", "France", "Ile-de-France", "Paris", RegionProfile.EU],
  ["Summit Data Services", "summitdata.io", "Technology", "11-50", "Canada", "Ontario", "Toronto", RegionProfile.OTHER],
  ["Koru Consulting", "koruconsulting.nz", "Consulting", "11-50", "New Zealand", "Auckland", "Auckland", RegionProfile.OTHER],
  ["Delta Industrial", "deltaindustrial.com", "Industrial", "201-500", "United States", "Georgia", "Atlanta", RegionProfile.US],
  ["Orbital Telecom", "orbitaltelecom.co.uk", "Telecommunications", "501-1000", "United Kingdom", "England", "Manchester", RegionProfile.UK],
  ["Pioneer Legal Ops", "pioneerlegal.io", "Legal Services", "51-200", "Ireland", "Leinster", "Dublin", RegionProfile.EU],
  ["Nordic Fleet", "nordicfleet.eu", "Transportation", "201-500", "Sweden", "Stockholm", "Stockholm", RegionProfile.EU],
  ["Cedar Growth Labs", "cedargrowth.com", "Marketing", "11-50", "United States", "New York", "New York", RegionProfile.US],
  ["Solace HR Network", "solacehr.com", "Human Resources", "51-200", "Australia", "New South Wales", "Sydney", RegionProfile.OTHER],
  ["Beacon Build Supply", "beaconbuild.com", "Construction", "201-500", "United States", "Washington", "Seattle", RegionProfile.US]
] as const;

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function fullName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`.trim();
}

async function main() {
  await prisma.emailEvent.deleteMany();
  await prisma.outboundEmail.deleteMany();
  await prisma.campaignRecipient.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.templateVersion.deleteMany();
  await prisma.template.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.unsubscribeToken.deleteMany();
  await prisma.suppressionEntry.deleteMany();
  await prisma.contactImport.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.company.deleteMany();
  await prisma.senderIdentity.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      id: ownerUserId,
      email: "owner@regionreach.dev",
      name: "Demo Owner"
    }
  });

  await prisma.workspace.create({
    data: {
      id: workspaceId,
      name: "RegionReach Demo",
      slug: "regionreach-demo",
      physicalPostalAddress: "500 Mission Street, Suite 400, San Francisco, CA 94105, United States",
      requireLawfulBasisBeforeSend: true,
      defaultRegionProfile: RegionProfile.US
    }
  });

  await prisma.workspaceMember.create({
    data: {
      workspaceId,
      userId: ownerUserId,
      role: UserRole.OWNER
    }
  });

  await prisma.senderIdentity.create({
    data: {
      id: senderId,
      workspaceId,
      fromName: "Nadia Wright",
      fromEmail: "nadia@regionreach.dev",
      replyToEmail: "reply@regionreach.dev",
      domain: "regionreach.dev",
      status: SenderStatus.VERIFIED,
      dkimStatus: "verified",
      spfStatus: "verified",
      dmarcStatus: "monitoring",
      provider: "mock",
      providerExternalId: "sender_demo_external"
    }
  });

  const companies = await Promise.all(
    companySeed.map(([name, domain, industry, employeeRange, country, region, city]) =>
      prisma.company.create({
        data: {
          workspaceId,
          name,
          domain,
          website: `https://${domain}`,
          industry,
          employeeRange,
          country,
          region,
          city
        }
      })
    )
  );

  const sampleTitles = [
    "VP of Growth",
    "Director of Operations",
    "Marketing Manager",
    "Head of Revenue",
    "Business Development Lead"
  ];

  const contacts = [];

  for (let index = 0; index < 50; index += 1) {
    const company = companies[index % companies.length]!;
    const firstName = ["Alex", "Jordan", "Taylor", "Morgan", "Casey"][index % 5]!;
    const lastName = ["Reed", "Patel", "Kim", "Lopez", "Chen"][Math.floor(index / 5) % 5]!;
    const email = `${slugify(firstName)}.${slugify(lastName)}.${index + 1}@${company.domain ?? "example.com"}`;
    const region =
      company.country === "United States"
        ? RegionProfile.US
        : company.country === "United Kingdom"
          ? RegionProfile.UK
          : ["Germany", "Netherlands", "France", "Ireland", "Sweden"].includes(company.country ?? "")
            ? RegionProfile.EU
            : RegionProfile.OTHER;

    contacts.push(
      prisma.contact.create({
        data: {
          workspaceId,
          companyId: company.id,
          firstName,
          lastName,
          fullName: fullName(firstName, lastName),
          jobTitle: sampleTitles[index % sampleTitles.length],
          email,
          contactType: ContactType.NAMED_BUSINESS_CONTACT,
          sourceType: index % 2 === 0 ? SourceType.PUBLIC_WEBSITE : SourceType.CSV_IMPORT,
          sourceUrl: `https://${company.domain}/team`,
          sourceNote: index % 3 === 0 ? "Public leadership page" : "Approved CSV list",
          lawfulBasis: index % 9 === 0 ? LawfulBasis.EXISTING_CUSTOMER : LawfulBasis.LEGITIMATE_INTEREST,
          consentStatus: index % 11 === 0 ? ConsentStatus.GRANTED : ConsentStatus.UNKNOWN,
          outreachStatus: index === 7 ? OutreachStatus.UNSUBSCRIBED : index === 19 ? OutreachStatus.SUPPRESSED : OutreachStatus.ACTIVE,
          regionProfile: region,
          tags: [company.industry ?? "General", region]
        }
      })
    );
  }

  const createdContacts = await Promise.all(contacts);

  const templates = await Promise.all([
    prisma.template.create({
      data: {
        workspaceId,
        name: "Regional Intro",
        subject: "Intro for {{companyName}} in {{region}}",
        previewText: "A compliant regional outreach starter",
        htmlContent:
          "<p>Hi {{firstName}},</p><p>We work with teams in {{region}} and thought {{companyName}} might benefit from our compliance-led outreach tooling.</p><p>{{senderName}}</p><p><a href='{{unsubscribeUrl}}'>Unsubscribe</a></p>",
        textContent:
          "Hi {{firstName}},\n\nWe work with teams in {{region}} and thought {{companyName}} might benefit from our compliance-led outreach tooling.\n\n{{senderName}}\n\nUnsubscribe: {{unsubscribeUrl}}",
        status: TemplateStatus.ACTIVE,
        createdByUserId: ownerUserId
      }
    }),
    prisma.template.create({
      data: {
        workspaceId,
        name: "Sector Follow-Up",
        subject: "Following up with {{industry}} leaders",
        previewText: "Tailored outreach for sector campaigns",
        htmlContent:
          "<p>Hello {{firstName}},</p><p>We help {{industry}} teams keep outbound programs auditable and region-aware.</p><p>{{senderName}}</p><p><a href='{{unsubscribeUrl}}'>Unsubscribe</a></p>",
        textContent:
          "Hello {{firstName}},\n\nWe help {{industry}} teams keep outbound programs auditable and region-aware.\n\n{{senderName}}\n\nUnsubscribe: {{unsubscribeUrl}}",
        status: TemplateStatus.ACTIVE,
        createdByUserId: ownerUserId
      }
    }),
    prisma.template.create({
      data: {
        workspaceId,
        name: "Compliance Check-In",
        subject: "A better compliance workflow for {{companyName}}",
        previewText: "Gentle compliance-led campaign copy",
        htmlContent:
          "<p>Hi {{firstName}},</p><p>We built RegionReach for teams that need lawful-basis tracking, suppression management, and clear sender identity.</p><p>{{senderName}}</p><p><a href='{{unsubscribeUrl}}'>Unsubscribe</a></p>",
        textContent:
          "Hi {{firstName}},\n\nWe built RegionReach for teams that need lawful-basis tracking, suppression management, and clear sender identity.\n\n{{senderName}}\n\nUnsubscribe: {{unsubscribeUrl}}",
        status: TemplateStatus.DRAFT,
        createdByUserId: ownerUserId
      }
    })
  ]);

  await Promise.all(
    templates.map((template) =>
      prisma.templateVersion.create({
        data: {
          templateId: template.id,
          versionNumber: 1,
          subject: template.subject,
          previewText: template.previewText,
          htmlContent: template.htmlContent,
          textContent: template.textContent,
          createdByUserId: ownerUserId
        }
      })
    )
  );

  const segments = await Promise.all([
    prisma.segment.create({
      data: {
        workspaceId,
        name: "US Technology",
        filterJson: {
          regionProfile: [RegionProfile.US],
          industries: ["Technology", "Cybersecurity"],
          outreachStatuses: [OutreachStatus.ACTIVE]
        },
        contactCountCache: 12,
        createdByUserId: ownerUserId
      }
    }),
    prisma.segment.create({
      data: {
        workspaceId,
        name: "EU Mid-Market",
        filterJson: {
          regionProfile: [RegionProfile.EU],
          employeeRanges: ["51-200", "201-500"],
          outreachStatuses: [OutreachStatus.ACTIVE]
        },
        contactCountCache: 14,
        createdByUserId: ownerUserId
      }
    })
  ]);

  const campaigns = await Promise.all([
    prisma.campaign.create({
      data: {
        workspaceId,
        name: "Q2 US Outreach",
        senderIdentityId: senderId,
        templateId: templates[0]!.id,
        segmentId: segments[0]!.id,
        htmlFooter:
          "<p>RegionReach Demo, 500 Mission Street, Suite 400, San Francisco, CA 94105</p><p><a href='{{unsubscribeUrl}}'>Unsubscribe</a></p>",
        textFooter:
          "RegionReach Demo, 500 Mission Street, Suite 400, San Francisco, CA 94105\nUnsubscribe: {{unsubscribeUrl}}",
        status: CampaignStatus.COMPLETED,
        startedAt: new Date("2026-03-15T10:00:00.000Z"),
        completedAt: new Date("2026-03-15T13:45:00.000Z"),
        eligibleRecipients: 9,
        blockedRecipients: 2,
        createdByUserId: ownerUserId
      }
    }),
    prisma.campaign.create({
      data: {
        workspaceId,
        name: "EU Compliance Follow-Up",
        senderIdentityId: senderId,
        templateId: templates[1]!.id,
        segmentId: segments[1]!.id,
        htmlFooter:
          "<p>RegionReach Demo, 500 Mission Street, Suite 400, San Francisco, CA 94105</p><p><a href='{{unsubscribeUrl}}'>Unsubscribe</a></p>",
        textFooter:
          "RegionReach Demo, 500 Mission Street, Suite 400, San Francisco, CA 94105\nUnsubscribe: {{unsubscribeUrl}}",
        status: CampaignStatus.RUNNING,
        startedAt: new Date("2026-03-22T09:00:00.000Z"),
        eligibleRecipients: 11,
        blockedRecipients: 1,
        createdByUserId: ownerUserId
      }
    })
  ]);

  const activeRecipients = createdContacts.slice(0, 12);

  for (const [index, contact] of activeRecipients.entries()) {
    const campaign = index < 6 ? campaigns[0]! : campaigns[1]!;
    const outboundEmail = await prisma.outboundEmail.create({
      data: {
        workspaceId,
        campaignId: campaign.id,
        recipientContactId: contact.id,
        senderIdentityId: senderId,
        toEmail: contact.email,
        subject: campaign.name,
        providerMessageId: `mock-${campaign.id}-${index + 1}`,
        status: index % 7 === 0 ? "BOUNCED_HARD" : "DELIVERED",
        queuedAt: new Date("2026-03-15T10:00:00.000Z"),
        sentAt: new Date("2026-03-15T10:05:00.000Z"),
        deliveredAt: index % 7 === 0 ? null : new Date("2026-03-15T10:06:00.000Z"),
        failedAt: index % 7 === 0 ? new Date("2026-03-15T10:06:00.000Z") : null
      }
    });

    await prisma.campaignRecipient.create({
      data: {
        campaignId: campaign.id,
        contactId: contact.id,
        email: contact.email,
        status: index % 7 === 0 ? "blocked" : "sent",
        blockedReason: index % 7 === 0 ? "Hard bounce received" : null,
        personalizationJson: {
          firstName: contact.firstName,
          companyName: companies.find((company) => company.id === contact.companyId)?.name
        },
        lastEventAt: new Date("2026-03-15T10:06:00.000Z")
      }
    });

    await prisma.emailEvent.createMany({
      data: [
        {
          workspaceId,
          outboundEmailId: outboundEmail.id,
          campaignId: campaign.id,
          contactId: contact.id,
          eventType: EmailEventType.QUEUED,
          metadata: { source: "seed" },
          occurredAt: new Date("2026-03-15T10:00:00.000Z")
        },
        {
          workspaceId,
          outboundEmailId: outboundEmail.id,
          campaignId: campaign.id,
          contactId: contact.id,
          eventType: EmailEventType.SENT,
          metadata: { provider: "mock" },
          occurredAt: new Date("2026-03-15T10:05:00.000Z")
        },
        {
          workspaceId,
          outboundEmailId: outboundEmail.id,
          campaignId: campaign.id,
          contactId: contact.id,
          eventType: index % 7 === 0 ? EmailEventType.BOUNCED_HARD : EmailEventType.DELIVERED,
          metadata: { provider: "mock", severity: index % 7 === 0 ? "hard" : "ok" },
          occurredAt: new Date("2026-03-15T10:06:00.000Z")
        }
      ]
    });
  }

  await prisma.contactImport.create({
    data: {
      workspaceId,
      fileName: "demo-public-contacts.csv",
      totalRows: 56,
      importedRows: 50,
      skippedRows: 3,
      duplicateRows: 3,
      status: "COMPLETED",
      createdByUserId: ownerUserId
    }
  });

  await prisma.suppressionEntry.create({
    data: {
      workspaceId,
      email: createdContacts[19]!.email,
      reason: "Manual suppression",
      source: "seed"
    }
  });

  await prisma.unsubscribeToken.createMany({
    data: createdContacts.slice(0, 6).map((contact, index) => ({
      workspaceId,
      contactId: contact.id,
      token: `seed-unsub-${index + 1}`
    }))
  });

  await prisma.auditLog.createMany({
    data: [
      {
        workspaceId,
        actorUserId: ownerUserId,
        action: "workspace.created",
        entityType: "workspace",
        entityId: workspaceId,
        metadata: { source: "seed" }
      },
      {
        workspaceId,
        actorUserId: ownerUserId,
        action: "campaign.completed",
        entityType: "campaign",
        entityId: campaigns[0]!.id,
        metadata: { eligibleRecipients: 9, blockedRecipients: 2 }
      },
      {
        workspaceId,
        actorUserId: ownerUserId,
        action: "sender.verified",
        entityType: "senderIdentity",
        entityId: senderId,
        metadata: { provider: "mock" }
      }
    ]
  });

  console.log("Seed complete for RegionReach demo workspace.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
