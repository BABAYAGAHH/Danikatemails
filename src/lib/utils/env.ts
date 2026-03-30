import { z } from "zod";

const authSecret =
  process.env.AUTH_SECRET ?? (process.env.NODE_ENV === "production" ? undefined : "dev-auth-secret");

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DIRECT_URL: z.string().min(1).optional(),
  AUTH_SECRET: z.string().min(1),
  AUTH_URL: z.string().url().default("http://localhost:3000"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  EMAIL_PROVIDER: z.enum(["mock", "resend"]).default("mock"),
  RESEND_API_KEY: z.string().optional(),
  APP_URL: z.string().url().default("http://localhost:3000"),
  WEBHOOK_SIGNING_SECRET: z.string().optional(),
  DEFAULT_FROM_EMAIL: z.string().email().default("hello@regionreach.dev"),
  DEFAULT_FROM_NAME: z.string().default("RegionReach")
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  AUTH_SECRET: authSecret,
  AUTH_URL: process.env.AUTH_URL,
  REDIS_URL: process.env.REDIS_URL,
  EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  APP_URL: process.env.APP_URL,
  WEBHOOK_SIGNING_SECRET: process.env.WEBHOOK_SIGNING_SECRET,
  DEFAULT_FROM_EMAIL: process.env.DEFAULT_FROM_EMAIL,
  DEFAULT_FROM_NAME: process.env.DEFAULT_FROM_NAME
});
