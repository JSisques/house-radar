import { ValueObject } from '@house-radar/building-blocks';

import { InvalidEnergyCertificateException } from './invalid-energy-certificate.exception';

export const ENERGY_CERTIFICATE_VALUES = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'in_process',
  'exempt',
  'unknown',
] as const;

export type EnergyCertificateValue = (typeof ENERGY_CERTIFICATE_VALUES)[number];

const LETTERS: readonly string[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

/** Energy certificate label (HR-F002-BR14). `in_process`, `exempt` and `unknown` are not letters. */
export class EnergyCertificate extends ValueObject<string> {
  get value(): EnergyCertificateValue {
    return this._value as EnergyCertificateValue;
  }

  get isLetter(): boolean {
    return LETTERS.includes(this._value);
  }

  protected validate(): void {
    if (!(ENERGY_CERTIFICATE_VALUES as readonly string[]).includes(this._value)) {
      throw new InvalidEnergyCertificateException(`value must be one of: ${ENERGY_CERTIFICATE_VALUES.join(', ')}`);
    }
  }

  toPrimitives(): string {
    return this._value;
  }
}
