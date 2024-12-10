import { INestApplication, ValidationPipe } from '@nestjs/common';
import {pipesSetup} from "./pipes.setup";

export const applyAppSettings = (app: INestApplication) => {
  app.enableCors();
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
