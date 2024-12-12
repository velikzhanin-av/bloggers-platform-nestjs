// import {
//   ArgumentsHost, Catch,
//   ExceptionFilter,
//   HttpException,
//   HttpStatus
// } from '@nestjs/common';
// import { log } from 'console';
// import { Request, Response } from 'express';
// import { OutputErrorsType } from 'src/base/types/output-errors.types';
//
// @Catch(HttpException)
// export class HttpExceptionFilterTest implements ExceptionFilter<HttpException> {
//   catch(exception: HttpException, host: ArgumentsHost) {
//     const ctx = host.switchToHttp();
//     const response = ctx.getResponse<Response>();
//     const request = ctx.getRequest<Request>();
//     const status = exception.getStatus();
//
//     if (status === HttpStatus.BAD_REQUEST) {
//       const errorsResponse = new OutputErrorsType();
//       // console.log(errorsResponse, " errorsResponse")
//       const responseBody: any = exception.getResponse();
//
//       if (Array.isArray(responseBody.message)) {
//         responseBody.message.forEach((e) => errorsResponse.errorsMessages.push(e));
//       } else {
//         errorsResponse.errorsMessages.push(responseBody.errorsMessages);
//       }
//       return response.status(status).send(errorsResponse); // Исправлено на errorsResponse
//     }
//     if (status === HttpStatus.UNAUTHORIZED) {
//       return response.sendStatus(401);
//     }
//     if (status === HttpStatus.TOO_MANY_REQUESTS) {
//       return response.sendStatus(429);
//     }
//     response.status(status).json({
//       statusCode: status,
//       timestamp: new Date().toISOString(),
//       path: request.url,
//     });
//   }
// }
