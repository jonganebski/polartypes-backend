import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account.dto';
import { FollowInput, FollowOutput } from './dto/follow.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
import {
  ReadFollowersInput,
  ReadFollowersOutput,
} from './dto/read-followers.dto';
import {
  ReadFollowingsInput,
  ReadFollowingsOutput,
} from './dto/read-followings.dto';
import { UnfollowInput, UnfollowOutput } from './dto/unfollow.dto';
import { Users } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard)
  @Query(() => Users)
  whoAmI(@AuthUser() user: Users): Users {
    return user;
  }

  @Mutation(() => CreateAccountOutput)
  createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.userService.createAccount(createAccountInput);
  }

  @Mutation(() => LoginOutput)
  login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.userService.login(loginInput);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => FollowOutput)
  follow(
    @AuthUser() user: Users,
    @Args('input') followInput: FollowInput,
  ): Promise<FollowOutput> {
    return this.userService.follow(user, followInput);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => UnfollowOutput)
  unfollow(
    @AuthUser() user: Users,
    @Args('input') unfollowInput: UnfollowInput,
  ): Promise<UnfollowOutput> {
    return this.userService.unfollow(user, unfollowInput);
  }

  @Query(() => ReadFollowersOutput)
  readFollowers(
    @Args('input') readFollowersInput: ReadFollowersInput,
  ): Promise<ReadFollowersOutput> {
    return this.userService.readFollowers(readFollowersInput);
  }

  @Query(() => ReadFollowingsOutput)
  readFollowings(
    @Args('input') readFollowingsInput: ReadFollowingsInput,
  ): Promise<ReadFollowingsOutput> {
    return this.userService.readFollowings(readFollowingsInput);
  }
}
