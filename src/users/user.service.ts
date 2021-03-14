import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
  ReadFollowingsInput,
  ReadFollowingsOutput,
} from './dto/read-followings.dto';
import { UnfollowInput, UnfollowOutput } from './dto/unfollow.dto';
import {
  UpdateAccountInput,
  UpdateAccountOutput,
} from './dto/update-account.dto';
import { Users } from './entities/user.entity';
import { COMMON_ERR } from 'src/errors/common.errors';

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
      let username = firstName + lastName;
      let slug = username.toLowerCase();
      let count = 0;
      while (true) {
        const existUser = await this.userRepo.findOne({ slug });
        if (existUser) {
          ++count;
          slug = slug + count + '';
        } else {
          if (count !== 0) {
            username = username + count + '';
          }
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
      return { ok: true, token, username };
    } catch (err) {
      console.log(err);
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
        user.username !== otherInputs.username,
      );
      const isUpdatingPassword = Boolean(password && newPassword);
      if (isUpdatingUsername) {
        const user = await this.userRepo.findOne({
          username: otherInputs.username,
        });
        if (user) {
          return { ok: false, error: USER_ERR.UsernameExists };
        }
      }
      console.log(password, newPassword, otherInputs);
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
      console.log(error);
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async login({
    usernameOrEmail,
    password,
    rememberMe,
  }: LoginInput): Promise<LoginOutput> {
    try {
      let user = await this.userRepo.findOne(
        { email: usernameOrEmail },
        { select: ['id', 'password', 'username'] },
      );
      if (!user) {
        user = await this.userRepo.findOne(
          { username: usernameOrEmail },
          { select: ['id', 'password', 'username'] },
        );
        if (!user) {
          return { ok: false, error: USER_ERR.WrongCredentials };
        }
      }
      const isMatch = await user.verifyPassword(password);
      if (!isMatch) {
        return { ok: false, error: USER_ERR.WrongCredentials };
      }
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

  async follow(user: Users, { id }: FollowInput): Promise<FollowOutput> {
    try {
      const targetUser = await this.userRepo.findOne(
        { id },
        { relations: ['followers'] },
      );
      if (!targetUser) {
        return { ok: false, error: USER_ERR.UserNotFound };
      }
      if (!targetUser.followers) {
        targetUser.followers = [user];
      } else {
        targetUser.followers = [...targetUser.followers, user];
      }
      await this.userRepo.save([
        { id, ...targetUser, followers: targetUser.followers },
      ]);
      return { ok: true, targetUserId: targetUser.id };
    } catch (err) {
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async unfollow(user: Users, { id }: UnfollowInput): Promise<UnfollowOutput> {
    try {
      const targetUser = await this.userRepo.findOne(
        { id },
        { relations: ['followers'] },
      );
      if (!targetUser) {
        return { ok: false, error: USER_ERR.UserNotFound };
      }
      targetUser.followers = targetUser.followers.filter(
        (follower) => follower.id !== user.id,
      );
      await this.userRepo.save([
        { id, ...targetUser, followers: targetUser.followers },
      ]);
      return { ok: true, targetUserId: targetUser.id };
    } catch {
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async deleteAccount(
    user: Users,
    deleteAccountInput: DeleteAccountInput,
  ): Promise<DeleteAccountoutput> {
    await this.userRepo.delete({ id: user.id });
    return { ok: true };
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
        return { ok: false, error: USER_ERR.UserNotFound };
      }
      return { ok: true, followings: targetUser.followings };
    } catch {
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }
}
