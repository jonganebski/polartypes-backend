import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { Users } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateStepInput, CreateStepOutput } from './dto/create-step.dto';
import { DeleteStepInput, DeleteStepOutput } from './dto/delete-step.dto';
import { LikeStepInput, LikeStepOutput } from './dto/like-step.dto';
import { UpdateStepInput, UpdateStepOutput } from './dto/update-step.dto';
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

  async likeStep(user: Users, { id }: LikeStepInput): Promise<LikeStepOutput> {
    try {
      const step = await this.stepRepo.findOne(id, {
        relations: ['likedUsers'],
      });
      console.log(step.likedUsers);
      if (!step) {
        return { ok: false, error: 'Step not found.' };
      }
      await this.stepRepo.save([
        { id, likedUsers: [...step.likedUsers, user] },
      ]);
      return { ok: true };
    } catch (err) {
      console.log(err);
      return { ok: false, error: 'Failed to like this step.' };
    }
  }

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
