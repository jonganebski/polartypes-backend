import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { COMMON_ERR, STEP_ERR } from 'src/common/common.constants';
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
      const { id: createdStepId } = await this.stepRepo.save(step);
      return { ok: true, createdStepId };
    } catch {
      return { ok: false, error: STEP_ERR.createStepfailed };
    }
  }

  async updateStep(
    user: Users,
    updateStepInput: UpdateStepInput,
  ): Promise<UpdateStepOutput> {
    try {
      const step = await this.stepRepo.findOne({ id: updateStepInput.stepId });
      if (!step) {
        return { ok: false, error: STEP_ERR.stepNotFound };
      }
      if (step.travelerId !== user.id) {
        return { ok: false, error: COMMON_ERR.notAuthorized };
      }
      await this.stepRepo.save([
        { id: updateStepInput.stepId, ...updateStepInput },
      ]);
      return { ok: true };
    } catch {
      return { ok: false, error: STEP_ERR.updateStepFailed };
    }
  }

  async deleteStep(
    user: Users,
    { stepId }: DeleteStepInput,
  ): Promise<DeleteStepOutput> {
    try {
      const step = await this.stepRepo.findOne({ id: stepId });
      if (!step) {
        return { ok: false, error: STEP_ERR.stepNotFound };
      }
      if (step.travelerId !== user.id) {
        return { ok: false, error: COMMON_ERR.notAuthorized };
      }
      await this.stepRepo.delete({ id: stepId });
      return { ok: true, stepId };
    } catch {
      return { ok: false, error: STEP_ERR.deleteStepFailed };
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
        return { ok: true, toggle: -999 };
      } else {
        const step = await this.stepRepo.findOne({ id: stepId });
        const like = this.likeRepo.create({ user, step });
        await this.likeRepo.save(like);
        return { ok: true, toggle: 999 };
      }
    } catch {
      return { ok: false, error: 'Failed to toggle like.' };
    }
  }
}
