import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CoreModule } from './core/core.module.js';

// Bounded contexts (`src/contexts/*`) are imported here as they arrive.
@Module({ imports: [CqrsModule.forRoot(), CoreModule] })
export class AppModule {}
