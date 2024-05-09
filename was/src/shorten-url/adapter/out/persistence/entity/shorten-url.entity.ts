import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, now } from 'mongoose';

@Schema({ collection: 'shorten_urls', timestamps: true })
export class ShortenUrlEntity {
  _id: ObjectId;

  @Prop()
  key: string;

  @Prop()
  originalUrl: string;

  @Prop()
  visitCount: number;

  @Prop({ default: now() })
  createdAt: Date;

  @Prop({ default: now() })
  updatedAt: Date;
}

export type ShortenUrlDocument = HydratedDocument<ShortenUrlEntity>;
export const ShortenUrlSchema = SchemaFactory.createForClass(ShortenUrlEntity);
