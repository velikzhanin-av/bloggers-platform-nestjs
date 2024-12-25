import { INestApplication, ValidationPipe } from '@nestjs/common';
import { pipesSetup } from './pipes.setup';
import cookieParser from 'cookie-parser';
import { validationConstraintSetup } from './validation-constraint.setup';

export const applyAppSettings = (app: INestApplication) => {
  app.enableCors();
  // useContainer(app, { fallback: true });
  validationConstraintSetup(app);
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
