import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'counts' })
export class CountEntity {
  @Prop()
  current: number;
}

export const CountSchema = SchemaFactory.createForClass(CountEntity);
