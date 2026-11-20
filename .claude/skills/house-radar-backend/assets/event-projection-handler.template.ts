// Path: src/contexts/properties/application/commands/project-listing-price-change/project-listing-price-change.handler.ts
// Idempotent projection command handler (D31). Application layer: it depends only on ports
// (`application/ports/`), never on MikroORM or infrastructure entities.
// Claim + projection write share ONE transaction: a crash rolls both back, a redelivery is a no-op.
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import {
  IProcessedEventRepository,
  PROCESSED_EVENT_REPOSITORY_TOKEN,
} from '@contexts/properties/application/ports/processed-event-repository.port';
import {
  IPropertyViewProjector,
  PROPERTY_VIEW_PROJECTOR_TOKEN,
} from '@contexts/properties/application/ports/property-view-projector.port';
import {
  ITransactionManager,
  TRANSACTION_MANAGER_TOKEN,
} from '@contexts/properties/application/ports/transaction-manager.port';

import { ProjectListingPriceChangeCommand } from './project-listing-price-change.command';

const CONSUMER = 'property-view.listing-price-changed';

@CommandHandler(ProjectListingPriceChangeCommand)
export class ProjectListingPriceChangeHandler
  implements ICommandHandler<ProjectListingPriceChangeCommand, void>
{
  constructor(
    @Inject(TRANSACTION_MANAGER_TOKEN)
    private readonly transactionManager: ITransactionManager,
    @Inject(PROCESSED_EVENT_REPOSITORY_TOKEN)
    private readonly processedEventRepository: IProcessedEventRepository,
    @Inject(PROPERTY_VIEW_PROJECTOR_TOKEN)
    private readonly projector: IPropertyViewProjector,
  ) {}

  async execute(command: ProjectListingPriceChangeCommand): Promise<void> {
    await this.transactionManager.run(async () => {
      const claimed = await this.processedEventRepository.claim(command.eventId, CONSUMER);
      if (!claimed) {
        return; // already processed: redelivery is harmless
      }
      await this.projector.applyPriceChange(command);
    });
  }
}

// Ports (each in its own file under application/ports/, Symbol token + I-prefixed interface):
//   ITransactionManager         { run<T>(fn: () => Promise<T>): Promise<T> }
//   IProcessedEventRepository   { claim(eventId: string, consumer: string): Promise<boolean> }
//   IPropertyViewProjector      { applyPriceChange(command: ProjectListingPriceChangeCommand): Promise<void> }
// Infrastructure implements them with MikroORM (see processed-event-repository.template.ts).
