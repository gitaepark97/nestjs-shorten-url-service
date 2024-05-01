import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Redirect,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ResponseValidationInterceptor } from 'src/common/validation/response-validation.interceptor';
import { CreateShortenUrlCommand } from 'src/shorten-url/application/port/in/command/create-shorten-url.command';
import { CreateShortenUrlUseCase } from 'src/shorten-url/application/port/in/create-shorten-url.use-case';
import { GetOriginalUrlUseCase } from 'src/shorten-url/application/port/in/get-original-url.use-case';
import { GetOriginalUrlQuery } from 'src/shorten-url/application/port/in/query/get-original-url.query';
import { generateErrorExample } from 'src/util/swagger.util';
import { CreateShortenUrlRequestBody } from './request/create-shorten-url.request';
import { RedirectToOriginalUrlRequestPath } from './request/redirect-to-original-url.request';
import { ShortenUrlResponse } from './response/shorten-url.response';

@ApiTags('단축 URL')
@Controller()
export class ShortenUrlController {
  constructor(
    private readonly createShortenUrlUseCase: CreateShortenUrlUseCase,
    private readonly getOriginalUrlUseCase: GetOriginalUrlUseCase,
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
  @Post('shorten-urls')
  @UseInterceptors(new ResponseValidationInterceptor(ShortenUrlResponse))
  async createShortenUrl(
    @Body() body: CreateShortenUrlRequestBody,
  ): Promise<ShortenUrlResponse> {
    const command = CreateShortenUrlCommand.builder()
      .set('originalUrl', body.originalUrl)
      .build();
    return this.createShortenUrlUseCase.execute(command);
  }

  @ApiOperation({
    summary: '원본 URL 리다이렉트 API',
    description: '단축 URL 키를 통해 원본 URL로 리다이렉트합니다.',
  })
  @ApiFoundResponse({ description: '성공' })
  @ApiBadRequestResponse({
    description: 'param 오류',
    content: {
      'application/json': {
        examples: {
          '원본 URL': {
            value: generateErrorExample(
              HttpStatus.BAD_REQUEST,
              '/:shortenUrlKey',
              '7자리 문자열을 입력하세요',
            ),
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: '존재 오류',
    content: {
      'application/json': {
        examples: {
          '단축 URL': {
            value: generateErrorExample(
              HttpStatus.NOT_FOUND,
              '/:shortenUrlKey',
              '등록된 단축 URL이 아닙니다.',
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
          '/:shortenUrlKey',
          '서버 오류입니다. 잠시 후 재시도해주세요.',
        ),
      },
    },
  })
  @Get(':shortenUrlKey')
  @Redirect()
  async redirectToOriginalUrl(@Param() path: RedirectToOriginalUrlRequestPath) {
    const query = GetOriginalUrlQuery.builder()
      .set('shortenUrlKey', path.shortenUrlKey)
      .build();

    const originalUrl = await this.getOriginalUrlUseCase.execute(query);
    return { url: originalUrl };
  }
}
