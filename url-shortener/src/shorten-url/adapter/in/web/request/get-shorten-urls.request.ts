import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class GetShortenUrlsQuery {
  @ApiProperty({
    description: '페이지',
    example: 1,
  })
  @IsInt({ message: '자연수를 입력하세요' })
  @Min(1, { message: '자연수를 입력하세요' })
  readonly page: number;

  @ApiProperty({
    description: '페이지 크기',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @IsInt({ message: '자연수를 입력하세요' })
  @Min(1, { message: '자연수를 입력하세요' })
  readonly pageSize: number = 10;
}
