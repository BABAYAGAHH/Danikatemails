import { Queue } from "bullmq";
import { getRedis } from "@/lib/queue/redis";

export const campaignQueueName = "campaign-recipient-dispatch";

export type CampaignRecipientJobData = {
  campaignId: string;
  workspaceId: string;
  recipientId: string;
  outboundEmailId: string;
  delayIndex: number;
};

let campaignQueue: Queue<CampaignRecipientJobData> | undefined;

function getCampaignQueue() {
  if (campaignQueue) {
    return campaignQueue;
  }

  campaignQueue = new Queue<CampaignRecipientJobData>(campaignQueueName, {
    connection: getRedis(),
    defaultJobOptions: {
      attempts: 3,
      removeOnComplete: 500,
      removeOnFail: 500,
      backoff: {
        type: "exponential",
        delay: 10_000
      }
    }
  });

  return campaignQueue;
}

export async function enqueueCampaignRecipientJob(
  job: CampaignRecipientJobData,
  delayMs: number
) {
  return getCampaignQueue().add(`${job.campaignId}:${job.recipientId}`, job, {
    jobId: `${job.campaignId}:${job.recipientId}`,
    delay: delayMs
  });
}
