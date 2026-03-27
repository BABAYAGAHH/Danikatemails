import { EmailEventType } from "@prisma/client";
import { MockEmailProvider } from "@/lib/email/mock-provider";

describe("event ingestion mapping", () => {
  it("maps mock webhook payloads into normalized email events", async () => {
    const provider = new MockEmailProvider();

    const result = await provider.parseWebhookEvent({
      events: [
        {
          id: "evt_1",
          messageId: "msg_1",
          email: "user@example.com",
          type: "clicked",
          occurredAt: "2026-03-26T00:00:00.000Z"
        }
      ]
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        providerEventId: "evt_1",
        providerMessageId: "msg_1",
        email: "user@example.com",
        eventType: EmailEventType.CLICKED
      })
    );
  });
});
