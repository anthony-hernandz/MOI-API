import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpServer,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';
import * as moment from 'moment-timezone';
//import { BitacoraService } from '../services/bitacora.service';
import { IBitLogErrores } from '../interfaces/createBitacoraErrors.interface';
import { logger } from '../logger/logger';

@Catch()
export class HttpExceptionFilter extends BaseExceptionFilter {
  constructor(
    @Inject(HttpAdapterHost) applicationRef: HttpServer,
    //private bitLogErroresService: BitacoraService,
  ) {
    super(applicationRef);
  }

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    let status: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const method = request['method'];
    let ipAddress = request?.ip || '';
    if (ipAddress.substr(0, 7) == '::ffff:') {
      ipAddress = ipAddress.substr(7);
    }

    let message =
      exception instanceof Error ? exception.message : exception.message.error;

    let detail: string;

    /** CODIGOS EN POSTGRES */
    const PostgresErrorCode = {
      UniqueViolation: 23505,
      CheckViolation: 23514,
      NotNullViolation: 23502,
      ForeignKeyViolation: 23503,
      ColumnNotExist: 42703,
      GroupByError: 42803,
      SintaxisQueryError: 42601,
      QueryFailedError: '42P01',
    };

    if (exception.response !== undefined) {
      message = exception.response.message;
    }

    if (!exception.status) {
      //cod key for value column table duplicated
      if (Object.values(PostgresErrorCode).includes(exception.code)) {
        message = exception.message;
        detail = exception.detail;
        status = HttpStatus.CONFLICT;
      }
    }

    const requestx: IBitLogErrores = {
      error: `${message} ${detail || ''}`,
      url: request.url,
      method: method,
      ip: ipAddress,
      date: moment().tz('America/El_Salvador').format(),
      id_user: null,
      params: JSON.stringify(request['params']),
      query: JSON.stringify(request['query']),
      body: JSON.stringify(request['body']),
    };

    // await this.bitLogErroresService.create(requestx);
    logger.error(JSON.stringify(requestx));

    response.status(status).json({
      status,
      message,
      detail:
        status === HttpStatus.INTERNAL_SERVER_ERROR
          ? 'Please contact with a admin of system.'
          : status == HttpStatus.CONFLICT
            ? detail
            : '',
      path: request.url,
    });
  }
}
