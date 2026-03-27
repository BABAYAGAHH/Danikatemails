import { EmailProvider } from "@/lib/email/provider";
import { MockEmailProvider } from "@/lib/email/mock-provider";
import { ResendEmailProvider } from "@/lib/email/resend-provider";
import { env } from "@/lib/utils/env";

let provider: EmailProvider | null = null;

export function getEmailProvider() {
  if (provider) {
    return provider;
  }

  provider = env.EMAIL_PROVIDER === "resend" ? new ResendEmailProvider() : new MockEmailProvider();
  return provider;
}
