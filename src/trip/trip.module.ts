import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { Like } from 'src/step/entities/like.entity';
import { Users } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/user.service';
import { Trip } from './entities/trip.entity';
import { TripResolver } from './trip.resolver';
import { TripService } from './trip.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, Users, Like])],
  providers: [TripResolver, TripService, AwsS3Service, UserService],
  exports: [TripService],
})
export class TripsModule {}
