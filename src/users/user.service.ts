import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
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
}
