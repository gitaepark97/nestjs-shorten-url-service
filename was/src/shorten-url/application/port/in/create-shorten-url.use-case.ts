import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { CreateShortenUrlCommand } from './command/create-shorten-url.command';

export abstract class CreateShortenUrlUseCase {
  abstract execute(command: CreateShortenUrlCommand): Promise<ShortenUrl>;
}
