import type { MaybePrimitives } from '@house-radar/shared-kernel';

export interface IObservationPrimitives {
  id: string;
  listingId: string;
  /** Null for a manual check. */
  runId: string | null;
  observedAt: Date;
  /** Euro cents. */
  price: MaybePrimitives<number>;
  status: string;
  snapshot: Readonly<Record<string, unknown>> | null;
}
