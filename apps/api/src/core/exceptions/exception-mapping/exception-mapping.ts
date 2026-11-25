/** Maps an exception class to the HTTP status and machine-readable code of its response. */
export interface ExceptionMapping {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- constructors of any arity are valid keys
  exception: abstract new (...args: any[]) => Error;
  status: number;
  code: string;
}
