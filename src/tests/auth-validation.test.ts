import { signInSchema, signUpSchema } from "@/lib/validators/auth";

describe("sign-up validation", () => {
  it("accepts a strong password and normalizes email", () => {
    const parsed = signUpSchema.parse({
      name: "Nadia Wright",
      email: "NADIA@Example.com ",
      password: "Demo12345!",
      workspaceName: "RegionReach Labs"
    });

    expect(parsed.email).toBe("nadia@example.com");
    expect(parsed.workspaceName).toBe("RegionReach Labs");
  });

  it("rejects weak passwords", () => {
    expect(() =>
      signUpSchema.parse({
        name: "Nadia Wright",
        email: "nadia@example.com",
        password: "weakpass",
        workspaceName: ""
      })
    ).toThrow("Password must include uppercase, lowercase, and a number");
  });
});

describe("sign-in validation", () => {
  it("normalizes the email field", () => {
    const parsed = signInSchema.parse({
      email: "Demo@RegionReach.App ",
      password: "Demo12345!"
    });

    expect(parsed.email).toBe("demo@regionreach.app");
  });
});
