import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? 'https://polartypes.netlify.app'
        : 'http://localhost:3000',
  });
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
