import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ collection: 'messages' })
export class MessageEntity {
  @Prop({ type: String })
  _id: string;
}

export const MessageSchema = SchemaFactory.createForClass(MessageEntity);
