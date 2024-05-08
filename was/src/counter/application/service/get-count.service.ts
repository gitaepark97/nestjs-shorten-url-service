import { Injectable } from '@nestjs/common';
import { GetCountUseCase } from '../port/in/get-count.use-case';
import { CommandCountPort } from '../port/out/command-count.port';

@Injectable()
export class GetCountService implements GetCountUseCase {
  constructor(private readonly commandCountPort: CommandCountPort) {}

  execute(): Promise<number> {
    return this.commandCountPort.findCountAndIncrease();
  }
}
