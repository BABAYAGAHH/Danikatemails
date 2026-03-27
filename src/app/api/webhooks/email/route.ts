import { NextRequest } from "next/server";
import { CampaignService } from "@/features/campaigns/campaign-service";
import { env } from "@/lib/utils/env";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { getRequestIp, jsonError, jsonOk } from "@/lib/utils/http";

export async function POST(request: NextRequest) {
  try {
    const ip = getRequestIp(request);
    const rateLimit = checkRateLimit(`email-webhook:${ip}`, 120, 60_000);

    if (!rateLimit.allowed) {
      throw new Error("Webhook rate limit exceeded");
    }

    if (env.WEBHOOK_SIGNING_SECRET) {
      const signature = request.headers.get("x-webhook-secret");
      if (signature !== env.WEBHOOK_SIGNING_SECRET) {
        throw new Error("Invalid webhook signature");
      }
    }

    return jsonOk(await CampaignService.ingestProviderWebhook(await request.json(), request.headers));
  } catch (error) {
    return jsonError(error);
  }
}
