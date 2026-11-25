import { Global, Module } from '@nestjs/common';

import { AppConfig } from '@core/config/app-config/app-config.js';
import { validateEnv } from '@core/config/env/env.schema.js';

@Global()
@Module({
  providers: [{ provide: AppConfig, useFactory: () => new AppConfig(validateEnv(process.env)) }],
  exports: [AppConfig],
})
export class CoreModule {}
