import { createOutboxEventSchema } from '@house-radar/outbox';

// Discovery loads this file natively, so it imports the package (resolved by Node) and not an alias.
export const OutboxEventSchema = createOutboxEventSchema('properties');
