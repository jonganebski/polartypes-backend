import { NestFactory } from '@nestjs/core';
import { SeederModule } from './seeder/seeder.module';
import { SeederService } from './seeder/seeder.service';

const bootstrap = async () => {
  NestFactory.createApplicationContext(SeederModule)
    .then((appContext) => {
      const seeder = appContext.get(SeederService);
      seeder.seed().finally(() => appContext.close());
    })
    .catch((err) => {
      throw err;
    });
};

bootstrap();
