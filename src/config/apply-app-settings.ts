import { INestApplication, ValidationPipe } from '@nestjs/common';
import { pipesSetup } from './pipes.setup';
import cookieParser from 'cookie-parser'

export const applyAppSettings = (app: INestApplication) => {
  app.enableCors();
  app.use(cookieParser());
  pipesSetup(app);
  app.useGlobalPipes(
    new ValidationPipe({
      //class-transformer создает экземпляр dto
      //соответственно применятся значения по-умолчанию
      //сработает наследование
      //и методы классов dto
      transform: true,
      stopAtFirstError: true,
    }),
  );
};
