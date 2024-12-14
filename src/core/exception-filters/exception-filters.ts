import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { OutputErrorsType } from 'src/core/types/output-errors.types';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    if (status === HttpStatus.BAD_REQUEST) {
      const errorsResponse = new OutputErrorsType();
      const responseBody: any = exception.getResponse();

      if (Array.isArray(responseBody.message)) {
        responseBody.message.forEach((e) =>
          errorsResponse.errorsMessages.push(e),
        );
      } else {
        errorsResponse.errorsMessages.push(responseBody.errorsMessages);
      }
      return response.status(status).send(errorsResponse); // Исправлено на errorsResponse
    }
    if (status === HttpStatus.UNAUTHORIZED) {
      return response.sendStatus(401);
    }

    if (status === HttpStatus.TOO_MANY_REQUESTS) {
      return response.sendStatus(429);
    }

    if (status === HttpStatus.NOT_IMPLEMENTED) {
      return response.sendStatus(501);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
