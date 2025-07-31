import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type bitacoraErros = HydratedDocument<logError>;

@Schema()
export class logError {
  @Prop()
  error: string;

  @Prop()
  url: string;

  @Prop()
  params: string;

  @Prop()
  body: string;

  @Prop()
  query: string;

  @Prop()
  method: string;

  @Prop()
  ip: string;

  @Prop(Date)
  date: Date;

  @Prop()
  id_user: string;
}

export const bitacoraErrosSchema = SchemaFactory.createForClass(logError);
