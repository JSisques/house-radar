/**
 * Ordering guard (D31): delivery order is not guaranteed, so a consumer applies an event only when its aggregate
 * version is newer than the one it already applied. A late event is then a no-op instead of overwriting newer state.
 */
export function isNewerVersion(eventVersion: number, appliedVersion: number | null): boolean {
  return appliedVersion === null || eventVersion > appliedVersion;
}
