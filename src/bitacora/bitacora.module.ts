import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './filters/httpExceptionsFilter';
/*import { MongooseModule } from '@nestjs/mongoose';
import { BitacoraService } from './services/bitacora.service';
import { logError, bitacoraErrosSchema } from './schemas/bitacora.schema';*/

@Module({
  imports: [
    /* MongooseModule.forFeature([
      { name: logError.name, schema: bitacoraErrosSchema },
    ]),*/
  ],
  providers: [
    // BitLogErroresService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    //BitacoraService,
  ],
})
export class BitacoraModule {}
