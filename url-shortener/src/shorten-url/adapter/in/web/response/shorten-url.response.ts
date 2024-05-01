import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, Length } from 'class-validator';

export class ShortenUrlResponse {
  @ApiProperty({
    description: '7자리 문자열로 구성된 단축 URL 키',
    example: '0A3B55H',
  })
  @Expose()
  @IsNotEmpty()
  @Length(7)
  readonly key: string;
}
