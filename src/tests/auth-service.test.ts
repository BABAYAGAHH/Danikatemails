import { vi } from "vitest";

process.env.DATABASE_URL = "postgresql://regionreach:test@localhost:5432/regionreach";
process.env.DIRECT_URL = process.env.DATABASE_URL;
process.env.AUTH_SECRET = "test-auth-secret";
process.env.AUTH_URL = "http://localhost:3000";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.APP_URL = "http://localhost:3000";
process.env.EMAIL_PROVIDER = "mock";

const findUnique = vi.fn();
const compare = vi.fn();

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    user: {
      findUnique
    }
  }
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare
  }
}));

const { AuthService } = await import("@/features/auth/auth-service");

describe("sign-in authorization", () => {
  beforeEach(() => {
    findUnique.mockReset();
    compare.mockReset();
  });

  it("returns null for unknown users", async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      AuthService.authorize({
        email: "missing@regionreach.app",
        password: "Demo12345!"
      })
    ).resolves.toBeNull();
  });

  it("returns the user when the password hash matches", async () => {
    findUnique.mockResolvedValue({
      id: "user_1",
      email: "demo@regionreach.app",
      name: "Demo User",
      image: null,
      passwordHash: "hashed"
    });
    compare.mockResolvedValue(true);

    const user = await AuthService.authorize({
      email: "demo@regionreach.app",
      password: "Demo12345!"
    });

    expect(user).toEqual(
      expect.objectContaining({
        id: "user_1",
        email: "demo@regionreach.app"
      })
    );
    expect(compare).toHaveBeenCalledWith("Demo12345!", "hashed");
  });

  it("returns null when the password does not match", async () => {
    findUnique.mockResolvedValue({
      id: "user_1",
      email: "demo@regionreach.app",
      name: "Demo User",
      image: null,
      passwordHash: "hashed"
    });
    compare.mockResolvedValue(false);

    await expect(
      AuthService.authorize({
        email: "demo@regionreach.app",
        password: "WrongPassword1"
      })
    ).resolves.toBeNull();
  });
});
