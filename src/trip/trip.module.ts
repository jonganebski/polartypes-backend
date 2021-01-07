import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsS3Module } from 'src/aws-s3/aws-s3.module';
import { CommonModule } from 'src/common/common.module';
import { Like } from 'src/step/entities/like.entity';
import { Users } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/user.module';
import { Trip } from './entities/trip.entity';
import { TripResolver } from './trip.resolver';
import { TripService } from './trip.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Trip, Users, Like]),
    AwsS3Module,
    UsersModule,
  ], // Injecting repository.
  providers: [TripResolver, TripService],
  exports: [TripService],
})
export class TripsModule {}
