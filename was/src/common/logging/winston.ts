import { WinstonModule, utilities } from 'nest-winston';
import { Environment } from 'src/config/env.validation';
import winston from 'winston';
import winstonDaily from 'winston-daily-rotate-file';

const dailyOption = (level: string) => {
  return {
    level,
    datePattern: 'YYYY-MM-DD',
    dirname: `./logs/${level}`,
    filename: `%DATE%.${level}.log`,
    maxFiles: 30,
    format: winston.format.combine(
      winston.format.timestamp(),
      utilities.format.nestLike(process.env.NODE_ENV, {
        colors: false,
        prettyPrint: true,
      }),
    ),
  };
};

const transports =
  process.env.NODE_ENV === Environment.Production
    ? [
        new winstonDaily(dailyOption('info')),
        new winstonDaily(dailyOption('warn')),
        new winstonDaily(dailyOption('error')),
      ]
    : [
        new winston.transports.Console({
          level: 'debug',
          format: winston.format.combine(
            winston.format.timestamp(),
            utilities.format.nestLike(process.env.NODE_ENV, {
              colors: true,
              prettyPrint: true,
            }),
          ),
        }),
      ];

export const winstonLogger = WinstonModule.createLogger({
  transports: transports,
});
