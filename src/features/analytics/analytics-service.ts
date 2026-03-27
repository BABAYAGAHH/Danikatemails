import { getWorkspaceOverview } from "@/lib/analytics/overview";

export class AnalyticsService {
  static async getOverview(workspaceId: string) {
    return getWorkspaceOverview(workspaceId);
  }
}
