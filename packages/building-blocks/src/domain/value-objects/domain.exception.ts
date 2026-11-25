export interface DomainExceptionOptions {
  cause?: unknown;
}

/** Base for every domain failure. Carries a stable machine-readable `code` and an optional `cause`. */
export abstract class DomainException extends Error {
  readonly code: string;

  protected constructor(code: string, message: string, options: DomainExceptionOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = new.target.name;
    this.code = code;
  }
}
