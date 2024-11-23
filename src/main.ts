import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersModule } from './users/users.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const users = await NestFactory.create(UsersModule);
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
