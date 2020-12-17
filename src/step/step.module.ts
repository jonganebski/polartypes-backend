import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { Users } from 'src/users/entities/user.entity';
import { Step } from './entities/step.entity';
import { StepResolver } from './step.resolver';
import { StepService } from './step.service';

@Module({
  imports: [TypeOrmModule.forFeature([Step, Trip, Users])],
  providers: [StepResolver, StepService],
})
export class StepModule {}
