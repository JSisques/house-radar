import type { Queue } from 'bullmq';
import { describe, expect, it, vi } from 'vitest';

import { bullmqOutboxDispatcher, outboxQueueName } from './bullmq-outbox-dispatcher';
import type { OutboxMessage } from './outbox-relay';

const message: OutboxMessage = {
  eventId: '0190a5c0-0000-7000-8000-000000000001',
  aggregateType: 'Listing',
  aggregateId: '0190a5c0-0000-7000-8000-000000000002',
  aggregateVersion: 1,
  eventType: 'ListingCreated',
  schemaVersion: 1,
  payload: {},
  metadata: { correlationId: 'c', causationId: null },
  occurredAt: new Date('2026-11-25T10:00:00.000Z'),
};

describe('outboxQueueName', () => {
  it('names the queue after the emitting context', () => {
    expect(outboxQueueName('listings')).toBe('listings.events');
  });
});

describe('bullmqOutboxDispatcher', () => {
  it('adds the event to the queue using its id as the job id', async () => {
    const add = vi.fn().mockResolvedValue(undefined);

    await bullmqOutboxDispatcher({ add } as unknown as Queue)(message);

    expect(add).toHaveBeenCalledWith(
      'ListingCreated',
      { ...message, occurredAt: '2026-11-25T10:00:00.000Z' },
      { jobId: message.eventId },
    );
  });

  it('rejects when the queue rejects so the relay keeps the row unpublished', async () => {
    const add = vi.fn().mockRejectedValue(new Error('redis down'));

    await expect(bullmqOutboxDispatcher({ add } as unknown as Queue)(message)).rejects.toThrow('redis down');
  });
});
