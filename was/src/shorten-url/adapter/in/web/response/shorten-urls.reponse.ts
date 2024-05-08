import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsUrl,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

class ShortenUrlResponse {
  @ApiProperty({
    description: '7자리 문자열로 구성된 단축 URL 키',
    example: '0A3B55H',
  })
  @Expose()
  @IsNotEmpty()
  @Length(7)
  readonly key: string;

  @ApiProperty({
    description: '원본 URL',
    example: 'https://example.com',
  })
  @Expose()
  @IsUrl()
  readonly originalUrl: string;

  @ApiProperty({
    description: '조회 수',
    example: 0,
  })
  @Expose()
  @IsInt()
  @Min(0)
  readonly visitCount: number;

  @ApiProperty({
    description: '생성일시',
    example: '0000-00-00T00:00:00.000Z',
  })
  @Expose()
  @IsDate()
  readonly createdAt: Date;

  @ApiProperty({
    description: '수정일시',
    example: '0000-00-00T00:00:00.000Z',
  })
  @Expose()
  @IsDate()
  readonly updatedAt: Date;
}

export class ShortenUrlsResponse {
  @ApiProperty({ description: '단축 URL 목록', type: [ShortenUrlResponse] })
  @Expose()
  @ValidateNested({ each: true })
  @Type(() => ShortenUrlResponse)
  readonly shortenUrls: ShortenUrlResponse[];

  @ApiProperty({ description: '전체 단축 URL 수', example: 0 })
  @Expose()
  @IsInt()
  @Min(0)
  readonly totalCount: number;
}
