import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { logError, bitacoraErros } from '../schemas/bitacora.schema';
import { IBitLogErrores } from '../interfaces/createBitacoraErrors.interface';

@Injectable()
export class BitacoraService {
  constructor(
    @InjectModel(logError.name) private logErrorModel: Model<bitacoraErros>,
  ) {}

  async create(createBitacoraDto: IBitLogErrores): Promise<bitacoraErros> {
    const createdCat = new this.logErrorModel(createBitacoraDto);
    return createdCat.save();
  }
}
