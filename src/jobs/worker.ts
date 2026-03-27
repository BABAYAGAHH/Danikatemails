import { Worker } from "bullmq";
import { campaignQueueName } from "@/lib/queue/campaign-queue";
import { getRedis } from "@/lib/queue/redis";
import { logger } from "@/lib/utils/logger";
import { handleCampaignRecipientJob } from "@/jobs/send-campaign-email";

const worker = new Worker(campaignQueueName, handleCampaignRecipientJob, {
  connection: getRedis(),
  concurrency: 5
});

worker.on("completed", (job) => {
  logger.info({ jobId: job.id }, "campaign recipient job completed");
});

worker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, error }, "campaign recipient job failed");
});

logger.info("RegionReach BullMQ worker is running");
