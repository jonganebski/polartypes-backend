import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/user.module';
import { UserResolver } from 'src/users/user.resolver';
import { UserService } from 'src/users/user.service';
import { Trip } from './entities/trip.entity';
import { TripResolver } from './trip.resolver';
import { TripService } from './trip.service';

@Module({
  imports: [TypeOrmModule.forFeature([Trip, Users])], // Injecting repository.
  providers: [TripResolver, TripService],
  exports: [TripService],
})
export class TripsModule {}
