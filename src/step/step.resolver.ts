import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { Users } from 'src/users/entities/user.entity';
import { CreateStepInput, CreateStepOutput } from './dto/create-step.dto';
import { DeleteStepInput, DeleteStepOutput } from './dto/delete-step.dto';
import { ToggleLikeInput, ToggleLikeOutput } from './dto/toggle-like.dto';
import { UpdateStepInput, UpdateStepOutput } from './dto/update-step.dto';
import { LikeService, StepService } from './step.service';

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

  @UseGuards(AuthGuard)
  @Mutation(() => UpdateStepOutput)
  updateStep(
    @AuthUser() user: Users,
    @Args('input') updateStepInput: UpdateStepInput,
  ): Promise<UpdateStepOutput> {
    return this.stepService.updateStep(user, updateStepInput);
  }

  // @UseGuards(AuthGuard)
  // @Mutation(() => ToggleLikeOutput)
  // likeStep(
  //   @AuthUser() user: Users,
  //   @Args('input') toggleLikeInput: ToggleLikeInput,
  // ): Promise<ToggleLikeOutput> {
  //   return this.stepService.likeStep(user, toggleLikeInput);
  // }

  @UseGuards(AuthGuard)
  @Mutation(() => DeleteStepOutput)
  deleteStep(
    @AuthUser() user: Users,
    @Args('input') deleteStepInput: DeleteStepInput,
  ): Promise<DeleteStepOutput> {
    return this.stepService.deleteStep(user, deleteStepInput);
  }
}

@Resolver()
export class LikeResolver {
  constructor(private readonly likeService: LikeService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => ToggleLikeOutput)
  toggleLike(
    @AuthUser() user: Users,
    @Args('input') toggleLikeInput: ToggleLikeInput,
  ): Promise<ToggleLikeOutput> {
    return this.likeService.toggleLike(user, toggleLikeInput);
  }
}
