import {
  Body,
  Controller,
  HttpStatus,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseValidationInterceptor } from 'src/common/validation/response-validation.interceptor';
import { CreateShortenUrlCommand } from 'src/shorten-url/application/port/in/command/create-shorten-url.command';
import { CreateShortenUrlUseCase } from 'src/shorten-url/application/port/in/create-shorten-url.use-case';
import { generateErrorExample } from 'src/util/swagger.util';
import { CreateShortenUrlRequestBody } from './request/create-shorten-url.request';
import { ShortenUrlResponse } from './response/shorten-url.response';

@ApiTags('단축 URL API')
@Controller('api/shorten-urls')
export class ShortenUrlController {
  constructor(
    private readonly createShortenUrlUseCase: CreateShortenUrlUseCase,
  ) {}

  @ApiOperation({
    summary: '단축 URL 생성 API',
    description: '원본 URL로부터 단축 URL을 생성합니다.',
  })
  @ApiCreatedResponse({ description: '성공', type: ShortenUrlResponse })
  @ApiBadRequestResponse({
    description: 'param 오류',
    content: {
      'application/json': {
        examples: {
          '원본 URL': {
            value: generateErrorExample(
              HttpStatus.BAD_REQUEST,
              '/api/shorten-urls',
              '올바른 URL을 입력하세요.',
            ),
          },
        },
      },
    },
  })
  @ApiInternalServerErrorResponse({
    description: '서버 오류',
    content: {
      'application/json': {
        example: generateErrorExample(
          HttpStatus.INTERNAL_SERVER_ERROR,
          '/api/shorten-urls',
          '서버 오류입니다. 잠시 후 재시도해주세요.',
        ),
      },
    },
  })
  @Post()
  @UseInterceptors(new ResponseValidationInterceptor(ShortenUrlResponse))
  async createShortenUrl(
    @Body() body: CreateShortenUrlRequestBody,
  ): Promise<ShortenUrlResponse> {
    const command = CreateShortenUrlCommand.builder()
      .set('originalUrl', body.originalUrl)
      .build();
    return this.createShortenUrlUseCase.execute(command);
  }
}
