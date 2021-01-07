import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Access } from 'src/auth/access.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Users } from 'src/users/entities/user.entity';
import { CreateStepInput, CreateStepOutput } from './dto/create-step.dto';
import { DeleteStepInput, DeleteStepOutput } from './dto/delete-step.dto';
import { ToggleLikeInput, ToggleLikeOutput } from './dto/toggle-like.dto';
import { UpdateStepInput, UpdateStepOutput } from './dto/update-step.dto';
import { LikeService, StepService } from './step.service';

@Resolver()
export class StepResolver {
  constructor(private readonly stepService: StepService) {}

  @Access('Signedin')
  @Mutation(() => CreateStepOutput)
  createStep(
    @AuthUser() user: Users,
    @Args('input') createStepInput: CreateStepInput,
  ): Promise<CreateStepOutput> {
    return this.stepService.createStep(user, createStepInput);
  }

  @Access('Signedin')
  @Mutation(() => UpdateStepOutput)
  updateStep(
    @AuthUser() user: Users,
    @Args('input') updateStepInput: UpdateStepInput,
  ): Promise<UpdateStepOutput> {
    return this.stepService.updateStep(user, updateStepInput);
  }

  @Access('Signedin')
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

  @Access('Signedin')
  @Mutation(() => ToggleLikeOutput)
  toggleLike(
    @AuthUser() user: Users,
    @Args('input') toggleLikeInput: ToggleLikeInput,
  ): Promise<ToggleLikeOutput> {
    return this.likeService.toggleLike(user, toggleLikeInput);
  }
}
