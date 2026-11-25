/** Envelope fields carried by every domain event. */
export interface EventMetadata {
  schemaVersion: number;
  /** Groups every event produced by one business operation. */
  correlationId: string;
  /** Id of the message that caused this event, or null when it has no cause. */
  causationId: string | null;
  occurredAt: Date;
}

export const DEFAULT_EVENT_SCHEMA_VERSION = 1;

function randomUuid(): string {
  const runtimeCrypto = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (runtimeCrypto?.randomUUID === undefined) {
    throw new Error('crypto.randomUUID is not available in this runtime');
  }
  return runtimeCrypto.randomUUID();
}

/** Builds a fresh envelope. Any field can be overridden, for example to propagate a correlation id. */
export function generateEventMetadata(overrides: Partial<EventMetadata> = {}): EventMetadata {
  return {
    schemaVersion: overrides.schemaVersion ?? DEFAULT_EVENT_SCHEMA_VERSION,
    correlationId: overrides.correlationId ?? randomUuid(),
    causationId: overrides.causationId ?? null,
    occurredAt: overrides.occurredAt ?? new Date(),
  };
}

/** Base for every domain event: the envelope plus the event's own payload in subclasses. */
export abstract class DomainEvent implements EventMetadata {
  readonly schemaVersion: number;
  readonly correlationId: string;
  readonly causationId: string | null;
  readonly occurredAt: Date;

  protected constructor(metadata: EventMetadata = generateEventMetadata()) {
    this.schemaVersion = metadata.schemaVersion;
    this.correlationId = metadata.correlationId;
    this.causationId = metadata.causationId;
    this.occurredAt = metadata.occurredAt;
  }
}
