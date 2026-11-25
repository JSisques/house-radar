import { v7 } from 'uuid';

/** Time-ordered UUID (RFC 9562 v7). Works in Node and in the browser. */
export function generateUuidV7(): string {
  return v7();
}
