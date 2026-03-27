import { PageHeader } from "@/components/page-header";
import { SegmentForm } from "@/features/segments/segment-form";
import { SegmentService } from "@/features/segments/segment-service";
import { resolveWorkspaceMembership } from "@/lib/auth/workspace";

export default async function SegmentsPage() {
  const { workspace } = await resolveWorkspaceMembership();
  const segments = await SegmentService.list(workspace.id);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Audience Logic"
        title="Segments"
        description="Store reusable regional and compliance-aware contact filters for campaigns."
      />
      <div className="grid gap-8 xl:grid-cols-[0.58fr_0.42fr]">
        <div className="space-y-4">
          {segments.map((segment) => (
            <div className="panel p-5" key={segment.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold">{segment.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Cached contacts: {segment.contactCountCache}
                  </div>
                </div>
              </div>
              <pre className="mt-4 overflow-x-auto rounded-2xl bg-muted/70 p-4 text-xs text-muted-foreground">
                {JSON.stringify(segment.filterJson, null, 2)}
              </pre>
            </div>
          ))}
        </div>
        <SegmentForm />
      </div>
    </div>
  );
}
