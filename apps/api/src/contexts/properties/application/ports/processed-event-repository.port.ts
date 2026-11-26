export const PROCESSED_EVENT_REPOSITORY_TOKEN = Symbol('PROCESSED_EVENT_REPOSITORY_TOKEN');

/** Records which events a consumer already handled (D31). */
export interface IProcessedEventRepository {
  /** Claims `(eventId, consumer)`. Resolves `false` when it was already claimed, so the event must be skipped. */
  claim(eventId: string, consumer: string): Promise<boolean>;
}
