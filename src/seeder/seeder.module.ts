import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AuthModule } from 'src/auth/auth.module';
import { AwsS3Module } from 'src/aws-s3/aws-s3.module';
import { CommentModule } from 'src/comment/comment.module';
import { Comment } from 'src/comment/entities/comment.entity';
import { CommonModule } from 'src/common/common.module';
import { JwtModule } from 'src/jwt/jwt.module';
import { Like } from 'src/step/entities/like.entity';
import { Step } from 'src/step/entities/step.entity';
import { StepModule } from 'src/step/step.module';
import { Trip } from 'src/trip/entities/trip.entity';
import { TripsModule } from 'src/trip/trip.module';
import { Users } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/user.module';
import { UserService } from 'src/users/user.service';
import { SeederService } from './seeder.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'development' ? '.env.dev' : '.env.test',
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .required(),
        POSTGRES_HOST: Joi.string(),
        POSTGRES_PORT: Joi.string(),
        POSTGRES_USERNAME: Joi.string(),
        POSTGRES_PASSWORD: Joi.string(),
        POSTGRES_DATABASE: Joi.string(),
        JWT_PRIVATE_KEY: Joi.string().required(),
        SUPERUSER_EMAIL: Joi.string().required(),
        SUPERUSER_FIRSTNAME: Joi.string().required(),
        SUPERUSER_LASTNAME: Joi.string().required(),
        SUPERUSER_TIMEZONE: Joi.string().required(),
        SUPERUSER_PASSWORD: Joi.string().required(),
        SEED_USER_PASSWORD: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...(process.env.DATABASE_URL
        ? { url: process.env.DATABASE_URL }
        : {
            host: process.env.POSTGRES_HOST,
            port: +process.env.POSTGRES_PORT,
            username: process.env.POSTGRES_USERNAME,
            password: process.env.POSTGRES_PASSWORD,
            database: process.env.POSTGRES_DATABASE,
          }),
      synchronize: process.env.NODE_ENV !== 'prod',
      logging:
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test',
      entities: [Users, Trip, Step, Comment, Like], // typeORM will only take care of these entities.
    }),
    TypeOrmModule.forFeature([Users, Like, Step, Comment, Trip]),
    JwtModule.forRoot({ jwtPrivateKey: process.env.JWT_PRIVATE_KEY }),
    UsersModule,
    TripsModule,
    CommentModule,
    StepModule,
    CommonModule,
    AuthModule,
    AwsS3Module,
  ],
  providers: [SeederService, UserService],
})
export class SeederModule {}
