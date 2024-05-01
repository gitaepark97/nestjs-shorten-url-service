import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class CreateShortenUrlRequestBody {
  @ApiProperty({
    description: '원본 URL',
    example: 'https://example.com',
  })
  @IsUrl({}, { message: '올바른 URL을 입력하세요.' })
  readonly originalUrl: string;
}
