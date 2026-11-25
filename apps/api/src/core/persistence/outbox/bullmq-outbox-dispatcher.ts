import type { Queue } from 'bullmq';

import type { OutboxContext } from '@core/persistence/outbox/outbox-event.schema.js';
import type { OutboxDispatcher } from '@core/persistence/outbox/outbox-relay.js';

/** One queue per emitting context, for example `listings.events`. Workers (`@Processor`) subscribe to it. */
export function outboxQueueName(context: OutboxContext): string {
  return `${context}.events`;
}

/**
 * Dispatcher that publishes each outbox row to BullMQ (D31, D7). The event ID is the job ID, so a row redelivered by the
 * relay while its job still exists in the queue is not enqueued twice; consumers stay idempotent for the rest
 * (`IdempotentConsumer`). A failed `add` rejects, so the relay keeps the row unpublished and retries it.
 */
export function bullmqOutboxDispatcher(queue: Queue): OutboxDispatcher {
  return async (message) => {
    await queue.add(
      message.eventType,
      { ...message, occurredAt: message.occurredAt.toISOString() },
      { jobId: message.eventId },
    );
  };
}
