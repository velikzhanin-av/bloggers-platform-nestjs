import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyAppSettings } from './config/apply-app-settings';
import {CoreConfig} from "./core/core.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  applyAppSettings(app);

  const coreConfig: CoreConfig = app.get<CoreConfig>(CoreConfig);
  const port: number = coreConfig.port
  console.log(`PORT: ${port}`);
  await app.listen(port);
}

bootstrap();
