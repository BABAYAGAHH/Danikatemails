import { OutreachStatus } from "@prisma/client";
import { vi } from "vitest";

process.env.DATABASE_URL = "postgresql://regionreach:test@localhost:5432/regionreach";
process.env.DIRECT_URL = process.env.DATABASE_URL;
process.env.REDIS_URL = "redis://localhost:6379";
process.env.APP_URL = "http://localhost:3000";
process.env.EMAIL_PROVIDER = "mock";

const contactFindFirstOrThrow = vi.fn();
const contactUpdate = vi.fn();
const auditCreate = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    contact: {
      findFirstOrThrow: contactFindFirstOrThrow,
      update: contactUpdate
    },
    auditLog: {
      create: auditCreate
    }
  }
}));

const { ComplianceService } = await import("@/features/compliance/compliance-service");

describe("unsubscribe flow", () => {
  beforeEach(() => {
    contactFindFirstOrThrow.mockReset();
    contactUpdate.mockReset();
    auditCreate.mockReset();
  });

  it("updates outreach status and triggers suppression", async () => {
    contactFindFirstOrThrow.mockResolvedValue({
      id: "contact_1",
      email: "user@example.com"
    });
    contactUpdate.mockResolvedValue({
      id: "contact_1",
      email: "user@example.com"
    });

    const suppressSpy = vi
      .spyOn(ComplianceService, "suppressEmail")
      .mockResolvedValue({ id: "suppression_1" } as never);

    await ComplianceService.unsubscribeContact("ws_1", "contact_1", "user_1");

    expect(contactUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "contact_1" },
        data: { outreachStatus: OutreachStatus.UNSUBSCRIBED }
      })
    );
    expect(suppressSpy).toHaveBeenCalledWith(
      "ws_1",
      "user@example.com",
      "user_1",
      "Unsubscribed",
      "unsubscribe"
    );
    expect(auditCreate).toHaveBeenCalled();

    suppressSpy.mockRestore();
  });
});
