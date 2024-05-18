import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { ConfigModule } from 'src/config/config.module';
import { MessageEntity, MessageSchema } from './entity/message.entity';
import { MessageAdapter, MessageRepository } from './message.adapter';

describe('ShortenUrlRepository', () => {
  let repository: MessageRepository;
  let db: Connection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        MongooseModule.forFeature([
          { name: MessageEntity.name, schema: MessageSchema },
        ]),
      ],
      providers: [
        {
          provide: MessageRepository,
          useClass: MessageAdapter,
        },
      ],
    }).compile();

    repository = module.get<MessageRepository>(MessageRepository);
    db = module.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    await db.collection('messages').drop();
  });

  describe('createMessage', () => {
    describe('성공', () => {
      it('메세지 생성', async () => {
        // given
        const messageId = '1';

        // when
        await repository.createMessage(messageId);

        // then
        const savedMessage = await db
          .collection('messages')
          .findOne({ _id: <any>messageId });
        expect(savedMessage!._id).toBe(messageId);
      });
    });
  });
});
