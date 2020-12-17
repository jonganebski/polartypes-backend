import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account.dto';
import { Users } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
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
          username = username + count + '';
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
}
