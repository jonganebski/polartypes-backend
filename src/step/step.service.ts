import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { Users } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateStepInput, CreateStepOutput } from './dto/create-step.dto';
import { DeleteStepInput, DeleteStepOutput } from './dto/delete-step.dto';
import { ToggleLikeInput, ToggleLikeOutput } from './dto/toggle-like.dto';
import { UpdateStepInput, UpdateStepOutput } from './dto/update-step.dto';
import { Like } from './entities/like.entity';
import { Step } from './entities/step.entity';

@Injectable()
export class StepService {
  constructor(
    @InjectRepository(Step) private readonly stepRepo: Repository<Step>,
    @InjectRepository(Trip) private readonly tripRepo: Repository<Trip>,
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
  ) {}

  async createStep(
    user: Users,
    createStepInput: CreateStepInput,
  ): Promise<CreateStepOutput> {
    try {
      const trip = await this.tripRepo.findOne({ id: createStepInput.tripId });
      const step = await this.stepRepo.create(createStepInput);
      step.traveler = user;
      step.trip = trip;
      await this.stepRepo.save(step);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Failed to create step.' };
    }
  }

  async updateStep(
    user: Users,
    updateStepInput: UpdateStepInput,
  ): Promise<UpdateStepOutput> {
    try {
      const step = await this.stepRepo.findOne({ id: updateStepInput.stepId });
      if (!step) {
        return { ok: false, error: 'Step not found.' };
      }
      if (step.travelerId !== user.id) {
        return { ok: false, error: 'You are not authorized.' };
      }
      await this.stepRepo.save([
        { id: updateStepInput.stepId, ...updateStepInput },
      ]);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Failed to update step.' };
    }
  }

  // async likeStep(
  //   user: Users,
  //   { id: stepId }: ToggleLikeInput,
  // ): Promise<ToggleLikeOutput> {
  //   try {
  // const step = await this.stepRepo.findOne(id, {
  //   relations: ['likedUsers'],
  // });
  // console.log(step.likedUsers);
  // if (!step) {
  //   return { ok: false, error: 'Step not found.' };
  // }
  // await this.stepRepo.save([
  //   { id, likedUsers: [...step.likedUsers, user] },
  // ]);
  // return { ok: true };
  //   } catch (err) {
  //     console.log(err);
  //     return { ok: false, error: 'Failed to like this step.' };
  //   }
  // }

  async deleteStep(
    user: Users,
    { stepId }: DeleteStepInput,
  ): Promise<DeleteStepOutput> {
    try {
      const step = await this.stepRepo.findOne({ id: stepId });
      if (!step) {
        return { ok: false, error: 'Step not found.' };
      }
      if (step.travelerId !== user.id) {
        return { ok: false, error: 'You are not authorized.' };
      }
      return { ok: true, error: "Not deleted. It's under development." };
    } catch {
      return { ok: false, error: 'Failed to delete step.' };
    }
  }
}

@Injectable()
export class LikeService {
  constructor(
    @InjectRepository(Like) private readonly likeRepo: Repository<Like>,
    @InjectRepository(Step) private readonly stepRepo: Repository<Step>,
  ) {}

  async toggleLike(
    user: Users,
    { id: stepId }: ToggleLikeInput,
  ): Promise<ToggleLikeOutput> {
    try {
      const like = await this.likeRepo.findOne({ userId: user.id, stepId });
      if (like) {
        await this.likeRepo.delete({
          userId: user.id,
          stepId,
        });
        return { ok: true };
      } else {
        const like = this.likeRepo.create({ userId: user.id, stepId });
        await this.likeRepo.save(like);
        return { ok: true };
      }
    } catch {
      return { ok: false, error: 'Failed to toggle like.' };
    }
  }
}
