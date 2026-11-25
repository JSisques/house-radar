import { DomainException } from '@house-radar/building-blocks';

export class InvalidEnergyCertificateException extends DomainException {
  constructor(reason: string) {
    super('INVALID_ENERGY_CERTIFICATE', `Invalid energy certificate: ${reason}`);
  }
}
