import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
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
import {
  UpdateAccountInput,
  UpdateAccountOutput,
} from './dto/update-account.dto';
import { Users } from './entities/user.entity';

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
        return { ok: false, error: 'Email already exists.' };
      }
      let username = firstName + lastName;
      let count = 0;
      while (true) {
        const existUser = await this.userRepo.findOne({ username });
        if (existUser) {
          ++count;
          username = firstName + lastName + count + '';
        } else {
          break;
        }
      }
      await this.userRepo.save(
        this.userRepo.create({
          email,
          password,
          firstName,
          lastName,
          username,
        }),
      );
      return { ok: true };
    } catch {
      return { ok: false, error: 'Failed to create account.' };
    }
  }

  async updateAccount(
    user: Users,
    updateAccountInput: UpdateAccountInput,
  ): Promise<UpdateAccountOutput> {
    try {
      const isUpdatingUsername = Boolean(
        user.username !== updateAccountInput.username,
      );
      if (isUpdatingUsername) {
        const isUsernameExists = await this.userRepo.findOne({
          username: updateAccountInput.username,
        });
        if (isUsernameExists) {
          return { ok: false, error: 'This username already exists.' };
        }
      }
      await this.userRepo.save([{ id: user.id, ...updateAccountInput }]);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Failed to update account.' };
    }
  }

  async login({ usernameOrEmail, password }: LoginInput): Promise<LoginOutput> {
    try {
      let user = await this.userRepo.findOne(
        { email: usernameOrEmail },
        { select: ['id', 'password'] },
      );
      if (!user) {
        user = await this.userRepo.findOne(
          { username: usernameOrEmail },
          { select: ['id', 'password'] },
        );
        if (!user) {
          return { ok: false, error: 'User does not exist.' };
        }
      }
      const isMatch = await user.verifyPassword(password);
      if (!isMatch) {
        return { ok: false, error: 'Wrong password.' };
      }
      const token = this.jwtService.sign(user.id);
      return { ok: true, token };
    } catch {
      return { ok: false, error: 'Failed to login.' };
    }
  }

  async findById(id: number) {
    try {
      const user = await this.userRepo.findOneOrFail({ id });
      return { user, error: null };
    } catch {
      return { user: null, error: 'Failed to find a user.' };
    }
  }

  async follow(user: Users, { id }: FollowInput): Promise<FollowOutput> {
    try {
      const targetUser = await this.userRepo.findOne(id, {
        relations: ['followers'],
      });
      if (!targetUser) {
        return { ok: false, error: 'User not found.' };
      }
      if (!targetUser.followers) {
        targetUser.followers = [user];
      } else {
        targetUser.followers = [...targetUser.followers, user];
      }
      await this.userRepo.save([
        { id, ...targetUser, followers: targetUser.followers },
      ]);
      return { ok: true };
    } catch (err) {
      console.log(err);
      return { ok: false, error: 'Failed to follow.' };
    }
  }

  async unfollow(user: Users, { id }: UnfollowInput): Promise<UnfollowOutput> {
    try {
      const targetUser = await this.userRepo.findOne(
        { id },
        { relations: ['followers'] },
      );
      if (!targetUser) {
        return { ok: false, error: 'User not found.' };
      }
      targetUser.followers = targetUser.followers.filter(
        (follower) => follower.id !== user.id,
      );
      await this.userRepo.save([
        { id, ...targetUser, followers: targetUser.followers },
      ]);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Failed to unfollow.' };
    }
  }

  async readFollowers({
    targetUserId,
  }: ReadFollowersInput): Promise<ReadFollowersOutput> {
    try {
      const targetUser = await this.userRepo.findOne({
        where: { id: targetUserId },
        relations: ['followers'],
      });
      if (!targetUser) {
        return { ok: false, error: 'User not found.' };
      }
      return { ok: true, followers: targetUser.followers };
    } catch {
      return { ok: false, error: 'Failed to load followers.' };
    }
  }

  async readFollowings({
    targetUserId,
  }: ReadFollowingsInput): Promise<ReadFollowingsOutput> {
    try {
      const targetUser = await this.userRepo.findOne({
        where: { id: targetUserId },
        relations: ['followings'],
      });
      if (!targetUser) {
        return { ok: false, error: 'User not found.' };
      }
      return { ok: true, followings: targetUser.followings };
    } catch {
      return { ok: false, error: 'Failed to load followings.' };
    }
  }

  // request delete images to aws s3.
}
