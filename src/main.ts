import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DEFAULT_PORT } from './common/common.constants';
import { static as expressStatic } from 'express';
import cors from 'cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(
    cors({
      origin:
        process.env.NODE_ENV === 'development'
          ? 'http://localhost:3000'
          : 'https://polartypes.netlify.app',
    }),
  );
  app.use('/static', expressStatic(process.cwd() + '/src/uploads'));
  await app.listen(process.env.PORT ?? DEFAULT_PORT);
}
bootstrap();
