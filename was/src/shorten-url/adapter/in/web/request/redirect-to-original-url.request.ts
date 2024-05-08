import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class RedirectToOriginalUrlRequestPath {
  @ApiProperty({
    description: '7자리 문자열로 구성된 단축 URL 키',
    example: '0A3B55H',
  })
  @IsNotEmpty()
  @Length(7, 7, { message: '7자리 문자열을 입력하세요' })
  readonly shortenUrlKey: string;
}
