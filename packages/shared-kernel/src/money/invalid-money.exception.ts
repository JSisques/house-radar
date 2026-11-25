import { DomainException } from '@house-radar/building-blocks';

export class InvalidMoneyException extends DomainException {
  constructor(reason: string) {
    super('INVALID_MONEY', `Invalid money: ${reason}`);
  }
}
