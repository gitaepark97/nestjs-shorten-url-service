import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MessageEntity } from './entity/message.entity';

export abstract class MessageRepository {
  abstract createMessage(messageId: string): Promise<void>;
}

@Injectable()
export class MessageAdapter implements MessageRepository {
  constructor(
    @InjectModel(MessageEntity.name)
    private readonly messageModel: Model<MessageEntity>,
  ) {}

  async createMessage(messageId: string): Promise<void> {
    const messageEntity = new this.messageModel({ _id: messageId });
    await messageEntity.save();
  }
}
