import { vi } from "vitest";

process.env.DATABASE_URL = "postgresql://regionreach:test@localhost:5432/regionreach";
process.env.DIRECT_URL = process.env.DATABASE_URL;
process.env.REDIS_URL = "redis://localhost:6379";
process.env.APP_URL = "http://localhost:3000";
process.env.EMAIL_PROVIDER = "mock";

const findFirst = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    contact: {
      findFirst
    }
  }
}));

const { ContactService } = await import("@/features/contacts/contact-service");

describe("duplicate contact detection", () => {
  beforeEach(() => {
    findFirst.mockReset();
  });

  it("normalizes email before lookup", async () => {
    findFirst.mockResolvedValue(null);

    const normalized = await ContactService.ensureUniqueEmail("ws_1", " USER@Example.com ");

    expect(normalized).toBe("user@example.com");
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          workspaceId: "ws_1",
          email: "user@example.com"
        })
      })
    );
  });

  it("throws when the email already exists inside the workspace", async () => {
    findFirst.mockResolvedValue({ id: "contact_1" });

    await expect(ContactService.ensureUniqueEmail("ws_1", "user@example.com")).rejects.toThrow(
      "A contact with this email already exists in the workspace"
    );
  });
});
