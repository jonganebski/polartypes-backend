import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Trip } from 'src/trip/entities/trip.entity';
import { Users } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateStepInput, CreateStepOutput } from './dto/create-step.dto';
import { DeleteStepInput, DeleteStepOutput } from './dto/delete-step.dto';
import { ReadStepsInput, ReadStepsOutput } from './dto/read-steps.dto';
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

  async readSteps(
    user: Users,
    { tripId }: ReadStepsInput,
  ): Promise<ReadStepsOutput> {
    try {
      const trip = await this.tripRepo.findOne(
        {
          id: tripId,
        },
        { relations: ['steps', 'steps.comments', 'steps.comments.creator'] },
      );
      if (!trip) {
        return { ok: false, error: 'Trip not found.' };
      }
      const targetUser = await this.userRepo.findOne({ id: trip.travelerId });
      if (!targetUser) {
        return { ok: false, error: 'User not found.' };
      }
      const isPrivate = Boolean(user?.id === trip.travelerId);
      const isPublic = Boolean(trip.availability === 2);
      const isFollower = Boolean(
        targetUser.followers?.includes(user) && trip.availability === 1,
      );
      if (isPrivate || isPublic || isFollower) {
        return { ok: true, steps: trip.steps };
      } else {
        return { ok: false, error: 'You are not authorized.' };
      }
    } catch (err) {
      console.log(err);
      return { ok: false, error: 'Failed to load steps.' };
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
