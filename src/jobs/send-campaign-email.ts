import { Job } from "bullmq";
import { CampaignRecipientJobData } from "@/lib/queue/campaign-queue";
import { EmailDispatchService } from "@/features/campaigns/email-dispatch-service";

export async function handleCampaignRecipientJob(job: Job<CampaignRecipientJobData>) {
  return EmailDispatchService.dispatchRecipient(job.data);
}
