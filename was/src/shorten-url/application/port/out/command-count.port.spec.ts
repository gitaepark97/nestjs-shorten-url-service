import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { ConfigModule } from 'src/config/config.module';
import { CountAdapter } from 'src/shorten-url/adapter/out/persistence/count.adapter';
import {
  CountEntity,
  CountSchema,
} from 'src/shorten-url/adapter/out/persistence/entity/count.entity';
import { CommandCountPort } from './command-count.port';

describe('CommandCountPort', () => {
  let port: CommandCountPort;
  let mongooseConnection: Connection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        MongooseModule.forFeature([
          { name: CountEntity.name, schema: CountSchema },
        ]),
      ],
      providers: [
        {
          provide: CommandCountPort,
          useClass: CountAdapter,
        },
      ],
    }).compile();

    port = module.get<CommandCountPort>(CommandCountPort);
    mongooseConnection = module.get<Connection>(getConnectionToken());
    await mongooseConnection.createCollection('counts');
    await mongooseConnection.collection('counts').insertOne({ current: 0 });
  });

  afterEach(async () => {
    await mongooseConnection.collection('counts').drop();
    await mongooseConnection.collection('shorten_urls').drop();
  });

  describe('findCountAndIncrease', () => {
    describe('성공', () => {
      it('count 조회 및 증가', async () => {
        // given

        // when
        const result1 = await port.findCountAndIncrease();
        const result2 = await port.findCountAndIncrease();

        // then
        expect(result1).toBe(0);
        expect(result2).toBe(result1 + 1);
      });
    });

    describe('동시성 테스트', () => {
      it('count 조회 및 증가', async () => {
        // given

        // when
        const tryCount = 10;
        const results = await Promise.all(
          Array.from({ length: tryCount }, async () =>
            port.findCountAndIncrease(),
          ),
        );

        // then
        const visited = Array.from({ length: tryCount }, () => false);
        results.forEach((result) => {
          visited[result] = true;
        });

        visited.forEach((val) => expect(val).toBeTruthy());
      });
    });
  });
});
