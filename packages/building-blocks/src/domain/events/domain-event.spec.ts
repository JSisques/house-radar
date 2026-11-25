import { describe, expect, it } from 'vitest';

import { DomainEvent, generateEventMetadata } from './domain-event';

class SampleEvent extends DomainEvent {
  constructor(metadata?: Parameters<typeof generateEventMetadata>[0]) {
    super(generateEventMetadata(metadata));
  }
}

describe('generateEventMetadata', () => {
  it('generates schemaVersion 1, a correlation id, no causation id and the current time', () => {
    const before = Date.now();
    const metadata = generateEventMetadata();

    expect(metadata.schemaVersion).toBe(1);
    expect(metadata.correlationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/);
    expect(metadata.causationId).toBeNull();
    expect(metadata.occurredAt.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('generates a different correlation id on each call', () => {
    expect(generateEventMetadata().correlationId).not.toBe(generateEventMetadata().correlationId);
  });

  it('keeps the overrides it is given', () => {
    const occurredAt = new Date('2026-01-01T00:00:00Z');

    expect(
      generateEventMetadata({ schemaVersion: 2, correlationId: 'corr', causationId: 'cause', occurredAt }),
    ).toEqual({ schemaVersion: 2, correlationId: 'corr', causationId: 'cause', occurredAt });
  });
});

describe('DomainEvent', () => {
  it('exposes the envelope', () => {
    const event = new SampleEvent({ correlationId: 'corr', causationId: 'cause' });

    expect(event.schemaVersion).toBe(1);
    expect(event.correlationId).toBe('corr');
    expect(event.causationId).toBe('cause');
    expect(event.occurredAt).toBeInstanceOf(Date);
  });
});
