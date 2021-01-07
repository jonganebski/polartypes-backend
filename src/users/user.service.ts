import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
      const sanitizedFirstName = firstName.replace(/[^a-zA-Z0-9]+/g, '');
      const sanitizedLastName = lastName.replace(/[^a-zA-Z0-9]+/g, '');
      if (!sanitizedFirstName || !sanitizedLastName) {
        return {
          ok: false,
          error: 'First and last name only accetps english and number.',
        };
      }
      let username = sanitizedFirstName + sanitizedLastName;
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
          firstName: sanitizedFirstName,
          lastName: sanitizedLastName,
          username,
          slug,
        }),
      );
      const token = this.jwtService.sign(savedUser.id, false);
      return { ok: true, token, username };
    } catch {
      return { ok: false, error: 'Failed to create account.' };
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
          return { ok: false, error: 'This username already exists.' };
        }
      }
      console.log(password, newPassword, otherInputs);
      if (isUpdatingPassword) {
        const isMatch = await currentUser.verifyPassword(password);
        if (!isMatch) {
          return { ok: false, error: 'Wrong password.' };
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
      return { ok: false, error: 'Failed to update account.' };
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
          return { ok: false, error: 'User does not exist.' };
        }
      }
      const isMatch = await user.verifyPassword(password);
      if (!isMatch) {
        return { ok: false, error: 'Wrong password.' };
      }
      const token = this.jwtService.sign(user.id, rememberMe);
      console.log(user);
      return { ok: true, token, username: user.username };
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
      return { ok: true, targetUserId: targetUser.id };
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
      return { ok: true, targetUserId: targetUser.id };
    } catch {
      return { ok: false, error: 'Failed to unfollow.' };
    }
  }

  async deleteAccount(
    user: Users,
    deleteAccountInput: DeleteAccountInput,
  ): Promise<DeleteAccountoutput> {
    await this.userRepo.delete({ id: user.id });
    return { ok: true };
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
}
