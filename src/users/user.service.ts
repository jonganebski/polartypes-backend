import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { COMMON_ERR } from 'src/errors/common.errors';
import { USER_ERR } from 'src/errors/user.errors';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
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
import {
  ListFollowersInput,
  ListFollowersOutput,
} from './dto/list-followers.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    firstName,
    lastName,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const existUser = await this.userRepo.findOne({ email });
      if (existUser) {
        return { ok: false, error: USER_ERR.EmailExists };
      }
      let username = (firstName + lastName).replace(/[ ,'-]/g, '');
      let slug = username.toLowerCase();
      let number = 1;
      while (true) {
        const existUser = await this.userRepo.count({ slug });
        if (existUser) {
          username = `${username}${number}`;
          slug = `${slug}${number}`;
          number++;
        } else {
          break;
        }
      }
      const savedUser = await this.userRepo.save(
        this.userRepo.create({
          email,
          password,
          firstName,
          lastName,
          username,
          slug,
        }),
      );
      const token = this.jwtService.sign(savedUser.id, false);
      return { ok: true, token, slug };
    } catch (err) {
      console.error(err);
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async updateAccount(
    user: Users,
    { password, newPassword, ...otherInputs }: UpdateAccountInput,
  ): Promise<UpdateAccountOutput> {
    try {
      const currentUser = await this.userRepo.findOne(
        { id: user.id },
        { select: ['password'] },
      );
      const isUpdatingUsername = Boolean(
        otherInputs.username && user.username !== otherInputs.username,
      );
      const isUpdatingPassword = Boolean(password && newPassword);

      if (isUpdatingUsername) {
        const existUserCount = await this.userRepo.count({
          where: { slug: otherInputs.username.toLowerCase() },
        });
        if (existUserCount) {
          return { ok: false, error: USER_ERR.UsernameExists };
        }
      }
      if (isUpdatingPassword) {
        const isMatch = await currentUser.verifyPassword(password);
        if (!isMatch) {
          return { ok: false, error: USER_ERR.WrongCredentials };
        }
        await this.userRepo.save(
          this.userRepo.create({
            id: user.id,
            password: newPassword,
            ...otherInputs,
          }),
        );
      } else {
        await this.userRepo.save({ id: user.id, ...otherInputs });
      }
      return { ok: true };
    } catch (error) {
      console.error(error);
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async login({
    usernameOrEmail,
    password,
    rememberMe,
  }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.userRepo.findOne({
        where: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
        select: ['id', 'username', 'password'],
      });
      if (!user) return { ok: false, error: USER_ERR.WrongCredentials };

      const isMatch = await user.verifyPassword(password);
      if (!isMatch) return { ok: false, error: USER_ERR.WrongCredentials };

      const token = this.jwtService.sign(user.id, rememberMe);
      return { ok: true, token, username: user.username };
    } catch {
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async findById(id: number): Promise<{ user?: Users; error?: string }> {
    try {
      const user = await this.userRepo.findOneOrFail({ id });
      return { user };
    } catch {
      return { error: COMMON_ERR.InternalServerErr };
    }
  }

  async follow(user: Users, { slug }: FollowInput): Promise<FollowOutput> {
    try {
      const targetUser = await this.userRepo.findOne({
        where: { slug },
        select: ['id'],
        relations: ['followers'],
      });
      if (!targetUser) return { ok: false, error: USER_ERR.UserNotFound };

      targetUser.followers = [...targetUser.followers, user];

      await this.userRepo.save([
        { slug, ...targetUser, followers: targetUser.followers },
      ]);
      return { ok: true, id: targetUser.id };
    } catch (err) {
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async unfollow(
    user: Users,
    { slug }: UnfollowInput,
  ): Promise<UnfollowOutput> {
    try {
      const targetUser = await this.userRepo.findOne({
        where: { slug },
        select: ['id'],
        relations: ['followers'],
      });
      if (!targetUser) return { ok: false, error: USER_ERR.UserNotFound };

      targetUser.followers = targetUser.followers.filter(
        (follower) => follower.id !== user.id,
      );

      await this.userRepo.save([
        { slug, ...targetUser, followers: targetUser.followers },
      ]);
      return { ok: true, id: targetUser.id };
    } catch {
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async deleteAccount(
    user: Users,
    { password }: DeleteAccountInput,
  ): Promise<DeleteAccountoutput> {
    const isMatch = await user.verifyPassword(password);
    try {
      if (!isMatch) return { ok: false, error: COMMON_ERR.NotAuthorized };

      const { affected } = await this.userRepo.delete({ id: user.id });
      if (!affected) throw Error();
      return { ok: true };
    } catch {
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async listFollowings({
    slug,
    cursorId,
  }: ListFollowingsInput): Promise<ListFollowingsOutput> {
    try {
      const take = 10;
      const [followings, count] = await this.userRepo
        .createQueryBuilder('user')
        .leftJoin('user.followers', 'follower')
        .where('follower.slug = :slug', { slug })
        .andWhere('user.id < :cursorId', {
          cursorId: cursorId ?? Math.pow(2, 31) - 1,
        })
        .orderBy('user.id', 'DESC')
        .take(take)
        .getManyAndCount();

      return {
        ok: true,
        user: { slug, followings },
        endCursorId: followings[followings.length - 1]?.id ?? null,
        hasNextPage: 0 < count - take,
      };
    } catch (err) {
      console.error(err);
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async listFollowers({
    slug,
    cursorId,
  }: ListFollowersInput): Promise<ListFollowersOutput> {
    try {
      const take = 10;
      const [followers, count] = await this.userRepo
        .createQueryBuilder('user')
        .leftJoin('user.followings', 'following')
        .where('following.slug = :slug', { slug })
        .andWhere('user.id < :cursorId', {
          cursorId: cursorId ?? Math.pow(2, 31) - 1,
        })
        .orderBy('user.id', 'DESC')
        .take(take)
        .getManyAndCount();

      return {
        ok: true,
        user: {
          slug,
          followers,
        },
        endCursorId: followers[followers.length - 1]?.id ?? null,
        hasNextPage: 0 < count - take,
      };
    } catch (err) {
      console.error(err);
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async countFollowings(user: Users): Promise<number> {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.followers', 'follower')
      .where('follower.id = :id', { id: user.id })
      .getCount();
  }

  async countFollowers(user: Users): Promise<number> {
    return this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.followings', 'following')
      .where('following.id = :id', { id: user.id })
      .getCount();
  }

  async isFollowing(rootUserSlug: string, authUser: Users): Promise<boolean> {
    if (authUser && rootUserSlug !== authUser.slug) {
      const count = await this.userRepo
        .createQueryBuilder('rootUser')
        .innerJoin('rootUser.followers', 'follower')
        .where('rootUser.slug = :slug', { slug: rootUserSlug })
        .andWhere('follower.id = :authUserId', { authUserId: authUser.id })
        .getCount();
      return Boolean(count);
    }
    return false;
  }
  async isFollower(rootUserSlug: string, authUser: Users): Promise<boolean> {
    if (authUser && rootUserSlug !== authUser.slug) {
      const count = await this.userRepo
        .createQueryBuilder('rootUser')
        .innerJoin('rootUser.followings', 'following')
        .where('rootUser.slug = :slug', { slug: rootUserSlug })
        .andWhere('following.id = :authUserId', { authUserId: authUser.id })
        .getCount();
      return Boolean(count);
    }
    return false;
  }
}
