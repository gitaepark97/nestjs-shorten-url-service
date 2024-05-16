import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { ConfigModule } from 'src/config/config.module';
import { CountAdapter } from 'src/shorten-url/adapter/out/persistence/count.adapter';
import {
  CountEntity,
  CountSchema,
} from 'src/shorten-url/adapter/out/persistence/entity/count.entity';
import { LoadAndUpdateCountPort } from './load-and-update-count.port';

describe('LoadAndUpdateCountPort', () => {
  let port: LoadAndUpdateCountPort;
  let db: Connection;

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
          provide: LoadAndUpdateCountPort,
          useClass: CountAdapter,
        },
      ],
    }).compile();

    port = module.get<LoadAndUpdateCountPort>(LoadAndUpdateCountPort);
    db = module.get<Connection>(getConnectionToken());
    await db.createCollection('counts');
    await db.collection('counts').insertOne({ current: 0 });
  });

  afterEach(async () => {
    await db.collection('counts').drop();
    await db.collection('shorten_urls').drop();
  });

  describe('findCountAndIncrease', () => {
    // describe('성공', () => {
    //   it('count 조회 및 증가', async () => {
    //     // given

    //     // when
    //     const result1 = await port.findCountAndIncrease();
    //     const result2 = await port.findCountAndIncrease();

    //     // then
    //     expect(result1).toBe(0);
    //     expect(result2).toBe(result1 + 1);
    //   });
    // });

    describe('동시성 테스트', () => {
      it('count 조회 및 증가', async () => {
        // given

        // when
        const tryCount = 10;
        const results = await Promise.all(
          Array.from({ length: tryCount }, () => port.findCountAndIncrease()),
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
