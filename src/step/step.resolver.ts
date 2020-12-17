import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { Users } from 'src/users/entities/user.entity';
import { CreateStepInput, CreateStepOutput } from './dto/create-step.dto';
import { DeleteStepInput, DeleteStepOutput } from './dto/delete-step.dto';
import { ReadStepsInput, ReadStepsOutput } from './dto/read-steps.dto';
import { UpdateStepInput, UpdateStepOutput } from './dto/update-step.dto';
import { StepService } from './step.service';

@Resolver()
export class StepResolver {
  constructor(private readonly stepService: StepService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => CreateStepOutput)
  createStep(
    @AuthUser() user: Users,
    @Args('input') createStepInput: CreateStepInput,
  ): Promise<CreateStepOutput> {
    return this.stepService.createStep(user, createStepInput);
  }

  @Query(() => ReadStepsOutput)
  readSteps(
    @AuthUser() user: Users,
    @Args('input') readStepsInput: ReadStepsInput,
  ): Promise<ReadStepsOutput> {
    return this.stepService.readSteps(user, readStepsInput);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => UpdateStepOutput)
  updateStep(
    @AuthUser() user: Users,
    @Args('input') updateStepInput: UpdateStepInput,
  ): Promise<UpdateStepOutput> {
    return this.stepService.updateStep(user, updateStepInput);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => DeleteStepOutput)
  deleteStep(
    @AuthUser() user: Users,
    @Args('input') deleteStepInput: DeleteStepInput,
  ): Promise<DeleteStepOutput> {
    return this.stepService.deleteStep(user, deleteStepInput);
  }
}
