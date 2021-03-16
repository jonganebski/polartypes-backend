import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DEFAULT_PORT } from './common/common.constants';
import { static as expressStatic } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://polartypes.netlify.app'
        : 'http://localhost:3000',
  });
  app.use('/static', expressStatic(process.cwd() + '/src/uploads'));
  await app.listen(process.env.PORT ?? DEFAULT_PORT);
}
bootstrap();
