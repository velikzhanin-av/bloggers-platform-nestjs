import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyAppSettings } from './config/apply-app-settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  applyAppSettings(app);

  await app.listen(process.env.PORT ?? 3000);

  return app.getHttpAdapter().getInstance();
}

module.exports = bootstrap();
