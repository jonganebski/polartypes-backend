import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { Users } from 'src/users/entities/user.entity';
import { Image } from './entities/image.entity';
import { Like } from './entities/like.entity';
import { Step } from './entities/step.entity';
import { ImageResolver, LikeResolver, StepResolver } from './step.resolver';
import { ImageService, LikeService, StepService } from './step.service';

@Module({
  imports: [TypeOrmModule.forFeature([Step, Trip, Users, Like, Image])],
  providers: [
    StepResolver,
    StepService,
    LikeResolver,
    LikeService,
    ImageResolver,
    ImageService,
  ],
})
export class StepModule {}
