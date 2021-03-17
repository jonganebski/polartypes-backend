import {
  Args,
  Int,
  Mutation,
  Query,
  ResolveField,
  Resolver,
  Root,
} from '@nestjs/graphql';
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
  ListFollowingsInput,
  ListFollowingsOutput,
} from './dto/list-followings.dto';
import { UnfollowInput, UnfollowOutput } from './dto/unfollow.dto';
import {
  UpdateAccountInput,
  UpdateAccountOutput,
} from './dto/update-account.dto';
import { Users } from './entities/user.entity';
import { UserService } from './user.service';
import {
  ListFollowersInput,
  ListFollowersOutput,
} from './dto/list-followers.dto';
import { WhoAmIOutput } from './dto/whoAmI.dto';
import { USER_ERR } from 'src/errors/user.errors';

@Resolver(Users)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Access('Signedin')
  @Query(() => WhoAmIOutput)
  whoAmI(@AuthUser() user: Users): WhoAmIOutput {
    if (!user) {
      return { ok: false, error: USER_ERR.UserNotFound };
    }
    return { ok: true, user };
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
  @Query(() => ListFollowingsOutput)
  listFollowings(
    @Args('input') listFollowingsInput: ListFollowingsInput,
  ): Promise<ListFollowingsOutput> {
    return this.userService.listFollowings(listFollowingsInput);
  }

  @Access('Signedin')
  @Query(() => ListFollowersOutput)
  listFollowers(
    @Args('input') listFollowersInput: ListFollowersInput,
  ): Promise<ListFollowersOutput> {
    return this.userService.listFollowers(listFollowersInput);
  }

  // ====== Resolved Fields =======

  @ResolveField(() => Int)
  async countFollowings(@Root() user: Users): Promise<number> {
    return this.userService.countFollowings(user);
  }

  @ResolveField(() => Int)
  async countFollowers(@Root() user: Users): Promise<number> {
    return this.userService.countFollwers(user);
  }

  @Access('Signedin')
  @ResolveField(() => Boolean)
  isMe(@Root() rootUser: Users, @AuthUser() authUser: Users) {
    if (!authUser) return false;
    return rootUser.id === authUser.id;
  }

  @Access('Signedin')
  @ResolveField(() => Boolean)
  async isFollowing(
    @Root() rootUser: Users,
    @AuthUser() authUser: Users,
  ): Promise<boolean> {
    return this.userService.isFollowing(rootUser.slug, authUser);
  }

  @Access('Signedin')
  @ResolveField(() => Boolean)
  async isFollower(
    @Root() rootUser: Users,
    @AuthUser() authUser: Users,
  ): Promise<boolean> {
    return this.userService.isFollower(rootUser.slug, authUser);
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
