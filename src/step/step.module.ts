import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { Users } from 'src/users/entities/user.entity';
import { UsersModule } from 'src/users/user.module';
import { Like } from './entities/like.entity';
import { Step } from './entities/step.entity';
import { LikeResolver, StepResolver } from './step.resolver';
import { LikeService, StepService } from './step.service';

@Module({
  imports: [TypeOrmModule.forFeature([Step, Trip, Users, Like]), UsersModule],
  providers: [StepResolver, StepService, LikeResolver, LikeService],
})
export class StepModule {}
