import { SenderStatus } from "@prisma/client";
import { vi } from "vitest";

process.env.DATABASE_URL = "postgresql://regionreach:test@localhost:5432/regionreach";
process.env.DIRECT_URL = process.env.DATABASE_URL;
process.env.REDIS_URL = "redis://localhost:6379";
process.env.APP_URL = "http://localhost:3000";
process.env.EMAIL_PROVIDER = "mock";

const findUniqueOrThrow = vi.fn();
const auditCreate = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    workspace: {
      findUniqueOrThrow
    },
    auditLog: {
      create: auditCreate
    }
  }
}));

const { ComplianceService } = await import("@/features/compliance/compliance-service");

describe("campaign launch blocking", () => {
  beforeEach(() => {
    findUniqueOrThrow.mockReset();
    auditCreate.mockReset();
  });

  it("throws when workspace address and unsubscribe footer are missing", async () => {
    findUniqueOrThrow.mockResolvedValue({
      id: "ws_1",
      requireLawfulBasisBeforeSend: true,
      physicalPostalAddress: null
    });

    await expect(
      ComplianceService.assertCampaignLaunchReady({
        workspaceId: "ws_1",
        actorUserId: "user_1",
        senderStatus: SenderStatus.PENDING,
        htmlFooter: "<p>Compliance footer</p>",
        textFooter: "Compliance footer"
      })
    ).rejects.toThrow();

    expect(auditCreate).toHaveBeenCalled();
  });
});
