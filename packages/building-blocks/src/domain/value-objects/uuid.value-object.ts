import { InvalidUuidException } from './invalid-uuid.exception';
import { ValueObject } from './value-object';

export interface UuidValueObjectOptions {
  /** Required RFC 9562 version, 1 to 8. */
  version?: number;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-([1-8])[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Validates format only. Generating UUIDs is out of scope. */
export class UuidValueObject extends ValueObject<string, UuidValueObjectOptions> {
  constructor(value: string, options: UuidValueObjectOptions = {}) {
    super(value, options);
  }

  get value(): string {
    return this._value;
  }

  protected validate(): void {
    const { version } = this.options;
    if (version !== undefined && (!Number.isInteger(version) || version < 1 || version > 8)) {
      throw new InvalidUuidException('version must be an integer between 1 and 8');
    }
    const match = typeof this._value === 'string' ? UUID_PATTERN.exec(this._value) : null;
    if (match === null) throw new InvalidUuidException('value is not a well-formed UUID');
    if (version !== undefined && Number(match[1]) !== version) {
      throw new InvalidUuidException(`value must be a version ${version} UUID`);
    }
  }

  toPrimitives(): string {
    return this._value;
  }
}
