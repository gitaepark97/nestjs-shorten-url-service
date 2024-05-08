import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CommandCountAdapter } from './adapter/out/persistence/command-count.adapter';
import {
  CountEntity,
  CountSchema,
} from './adapter/out/persistence/entity/count.entity';
import { GetCountUseCase } from './application/port/in/get-count.use-case';
import { CommandCountPort } from './application/port/out/command-count.port';
import { GetCountService } from './application/service/get-count.service';

const ports = [{ provide: CommandCountPort, useClass: CommandCountAdapter }];

const useCases = [{ provide: GetCountUseCase, useClass: GetCountService }];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CountEntity.name, schema: CountSchema },
    ]),
  ],
  providers: [...useCases, ...ports],
  exports: [CommandCountPort],
})
export class CounterModule {}
