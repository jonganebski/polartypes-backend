import { Injectable } from '@nestjs/common';
import { UserService } from 'src/users/user.service';
import * as faker from 'faker';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
    private readonly userService: UserService,
  ) {}

  async seed() {
    console.log('🌱 Seeding users...');
    const slugs: string[] = [];
    for (let i = 0; i < 50; i++) {
      const { slug } = await this.userService.createAccount({
        email: faker.internet.email(),
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        password: process.env.SEED_USER_PASSWORD,
      });
      slugs.push(slug);
    }
    const users = await this.userRepo
      .createQueryBuilder('user')
      .where('user.slug IN(:...slugs)', { slugs })
      .getMany();

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const otherUsers = users.filter((_, index) => index !== i);
      for (let j = 0; j < otherUsers.length - 1; j++) {
        const otherUser = otherUsers[j];
        await this.userService.follow(user, { slug: otherUser.slug });
      }
    }

    console.log('🌱 Seeding done! 🌱');
  }
}
