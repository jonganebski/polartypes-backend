import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Access } from 'src/auth/access.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account.dto';
import {
  DeleteAccountInput,
  DeleteAccountoutput,
} from './dto/delete-account.dto';
import { FollowInput, FollowOutput } from './dto/follow.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
import {
  ReadFollowingsInput,
  ReadFollowingsOutput,
} from './dto/read-followings.dto';
import { UnfollowInput, UnfollowOutput } from './dto/unfollow.dto';
import {
  UpdateAccountInput,
  UpdateAccountOutput,
} from './dto/update-account.dto';
import { Users } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Access('Signedin')
  @Query(() => Users)
  whoAmI(@AuthUser() user: Users): Users {
    return user;
  }

  @Access('Any')
  @Mutation(() => CreateAccountOutput)
  createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.userService.createAccount(createAccountInput);
  }

  @Access('Signedin')
  @Mutation(() => UpdateAccountOutput)
  updateAccount(
    @AuthUser() user: Users,
    @Args('input') updateAccountInput: UpdateAccountInput,
  ): Promise<UpdateAccountOutput> {
    return this.userService.updateAccount(user, updateAccountInput);
  }

  @Access('Any')
  @Mutation(() => LoginOutput)
  login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.userService.login(loginInput);
  }

  @Access('Signedin')
  @Mutation(() => FollowOutput)
  follow(
    @AuthUser() user: Users,
    @Args('input') followInput: FollowInput,
  ): Promise<FollowOutput> {
    return this.userService.follow(user, followInput);
  }

  @Access('Signedin')
  @Mutation(() => UnfollowOutput)
  unfollow(
    @AuthUser() user: Users,
    @Args('input') unfollowInput: UnfollowInput,
  ): Promise<UnfollowOutput> {
    return this.userService.unfollow(user, unfollowInput);
  }

  @Access('Signedin')
  @Mutation(() => DeleteAccountoutput)
  deleteAccount(
    @AuthUser() user: Users,
    @Args('input') deleteAccountInput: DeleteAccountInput,
  ): Promise<DeleteAccountoutput> {
    return this.userService.deleteAccount(user, deleteAccountInput);
  }

  @Access('Signedin')
  @Query(() => ReadFollowingsOutput)
  readFollowings(
    @Args('input') readFollowingsInput: ReadFollowingsInput,
  ): Promise<ReadFollowingsOutput> {
    return this.userService.readFollowings(readFollowingsInput);
  }

  // @Access('Signedin')
  // @Subscription(() => String)
  // searchUser() {
  //   return pubsub.asyncIterator('allMight');
  // }

  // @Access('Signedin')
  // @Mutation(() => Boolean)
  // transferOneForAll() {
  //   pubsub.publish('allMight', { searchUser: "next, it's your turn." });
  //   return true;
  // }
}
