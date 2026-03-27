import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ComplianceService } from "@/features/compliance/compliance-service";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { getRequestIp } from "@/lib/utils/http";

async function handleUnsubscribe(request: NextRequest, token: string) {
  const ip = getRequestIp(request);
  const rateLimit = checkRateLimit(`unsubscribe:${token}:${ip}`, 20, 60_000);

  if (!rateLimit.allowed) {
    return new Response("Too many unsubscribe attempts", { status: 429 });
  }

  const record = await prisma.unsubscribeToken.findUnique({
    where: { token },
    include: { contact: true }
  });

  if (!record || (record.expiresAt && record.expiresAt.getTime() < Date.now())) {
    return new Response("Unsubscribe link is invalid or expired.", { status: 410 });
  }

  await ComplianceService.unsubscribeContact(record.workspaceId, record.contactId, null);

  return new Response(
    "<html><body style=\"font-family:system-ui;padding:40px;\"><h1>You're unsubscribed</h1><p>RegionReach will not send further outreach to this address.</p></body></html>",
    {
      headers: {
        "content-type": "text/html; charset=utf-8"
      }
    }
  );
}

export async function GET(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  return handleUnsubscribe(request, token);
}

export async function POST(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  return handleUnsubscribe(request, token);
}
