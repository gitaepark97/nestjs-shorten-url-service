import { registerAs } from '@nestjs/config';

export const serverConfig = registerAs('serer', () => ({
  port: parseInt(process.env.PORT!),
}));
