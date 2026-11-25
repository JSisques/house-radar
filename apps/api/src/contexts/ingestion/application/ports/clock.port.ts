import type { DateValueObject } from '@house-radar/building-blocks';

export const CLOCK_PORT = Symbol('CLOCK_PORT');

/** Current time as a value object; replaceable in tests. */
export type IClock = () => DateValueObject;
