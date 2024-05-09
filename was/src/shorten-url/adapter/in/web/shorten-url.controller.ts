import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Redirect,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiFoundResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { generateErrorExample } from 'src/common/open-api/swagger';
import { ResponseValidationInterceptor } from 'src/common/validation/response-validation.interceptor';
import { CreateShortenUrlCommand } from 'src/shorten-url/application/port/in/command/create-shorten-url.command';
import { CreateShortenUrlUseCase } from 'src/shorten-url/application/port/in/create-shorten-url.use-case';
import { GetOriginalUrlUseCase } from 'src/shorten-url/application/port/in/get-original-url.use-case';
import { GetShortenUrlsUseCase } from 'src/shorten-url/application/port/in/get-shorten-urls.use-case';
import { CreateShortenUrlRequestBody } from './request/create-shorten-url.request';
import { GetShortenUrlsRequestQuery } from './request/get-shorten-urls.request';
import { RedirectToOriginalUrlRequestPath } from './request/redirect-to-original-url.request';
import { ShortenUrlKeyResponse } from './response/shorten-url-key.response';
import { ShortenUrlsResponse } from './response/shorten-urls.reponse';

@ApiTags('단축 URL')
@Controller('shorten-urls')
export class ShortenUrlController {
  constructor(
    private readonly createShortenUrlUseCase: CreateShortenUrlUseCase,
    private readonly getOriginalUrlUseCase: GetOriginalUrlUseCase,
    private readonly getShortenUrlsUseCase: GetShortenUrlsUseCase,
  ) {}

  @ApiOperation({
    summary: '단축 URL 생성 API',
    description: '원본 URL로부터 단축 URL을 생성합니다.',
  })
  @ApiCreatedResponse({ description: '성공', type: ShortenUrlKeyResponse })
  @ApiBadRequestResponse({
    description: '잘못된 입력',
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
  @UseInterceptors(new ResponseValidationInterceptor(ShortenUrlKeyResponse))
  async createShortenUrl(
    @Body() body: CreateShortenUrlRequestBody,
  ): Promise<ShortenUrlKeyResponse> {
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
    description: '잘못된 입력',
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
    description: '존재하지 않는 데이터',
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
    const originalUrl = await this.getOriginalUrlUseCase.execute(
      path.shortenUrlKey,
    );
    return { url: originalUrl };
  }

  @ApiOperation({
    summary: '단축 URL 목록 조회 API',
    description: '단축 URL 목록을 조회합니다.',
  })
  @ApiOkResponse({ description: '성공', type: ShortenUrlsResponse })
  @ApiBadRequestResponse({
    description: '잘못된 입력',
    content: {
      'application/json': {
        examples: {
          페이지: {
            value: generateErrorExample(
              HttpStatus.BAD_REQUEST,
              '/:shortenUrlKey',
              '자연수를 입력하세요',
            ),
          },
          '페이지 크기': {
            value: generateErrorExample(
              HttpStatus.BAD_REQUEST,
              '/:shortenUrlKey',
              '자연수를 입력하세요',
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
          '/shorten-urls',
          '서버 오류입니다. 잠시 후 재시도해주세요.',
        ),
      },
    },
  })
  @Get()
  @UseInterceptors(new ResponseValidationInterceptor(ShortenUrlsResponse))
  async getShortenUrls(
    @Query() query: GetShortenUrlsRequestQuery,
  ): Promise<ShortenUrlsResponse> {
    return this.getShortenUrlsUseCase.execute(query.pageNumber, query.pageSize);
  }
}
