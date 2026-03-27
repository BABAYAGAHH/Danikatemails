import {
  ConsentStatus,
  LawfulBasis,
  OutreachStatus,
  SenderStatus
} from "@prisma/client";
import {
  evaluateCampaignLaunchReadiness,
  evaluateContactEligibility
} from "@/lib/compliance/rules";

describe("compliance eligibility rules", () => {
  it("blocks unsubscribed contacts and missing lawful basis", () => {
    const result = evaluateContactEligibility(
      {
        email: "jane@example.com",
        lawfulBasis: LawfulBasis.NOT_SET,
        consentStatus: ConsentStatus.UNKNOWN,
        outreachStatus: OutreachStatus.UNSUBSCRIBED
      },
      {
        requireLawfulBasisBeforeSend: true,
        physicalPostalAddress: "123 Main St"
      }
    );

    expect(result.eligible).toBe(false);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        "Outreach blocked: unsubscribed",
        "Lawful basis required before send"
      ])
    );
  });

  it("blocks campaign launch when sender is unverified or footer data is missing", () => {
    const result = evaluateCampaignLaunchReadiness(
      {
        requireLawfulBasisBeforeSend: true,
        physicalPostalAddress: null
      },
      {
        senderStatus: SenderStatus.PENDING,
        htmlFooter: "<p>Footer only</p>",
        textFooter: "Footer only"
      }
    );

    expect(result.ready).toBe(false);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        "Workspace physical postal address is required",
        "Campaign footer must include unsubscribe copy",
        "Sender identity must be verified"
      ])
    );
  });
});
