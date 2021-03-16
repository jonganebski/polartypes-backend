import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as faker from 'faker';
import { Comment } from 'src/comment/entities/comment.entity';
import { Like } from 'src/step/entities/like.entity';
import { Step } from 'src/step/entities/step.entity';
import { TripService } from 'src/trip/trip.service';
import { Users } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/user.service';
import { Repository } from 'typeorm';
import {
  EXAMPLE_STEPS,
  EXAMPLE_TRIP,
  SEED_USERS_COUNT,
} from './seeder.constants';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
    @InjectRepository(Like) private readonly likeRepo: Repository<Like>,
    @InjectRepository(Step) private readonly stepRepo: Repository<Step>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly userService: UserService,
    private readonly tripService: TripService,
  ) {}
  private superuser: Users;
  private tripId: number;
  private steps: Step[] = [];
  private users: Users[] = [];

  async seed() {
    try {
      await this.seedSuperUser();
      await this.seedUsers();
      await this.seedFollowRelationships();
      await this.seedTrip();
      await this.seedSteps();
      await this.seedLikes();
      await this.seedComments();
      console.log('🌱 Seeding done! 🌱');
    } catch (err) {
      console.error('❌ Seeding aborted. Error: ', err);
    }
  }

  private async seedSuperUser() {
    console.log('🌱 Seeding superuser...');
    try {
      const superuser = await this.userRepo.create({
        email: process.env.SUPERUSER_EMAIL,
        firstName: process.env.SUPERUSER_FIRSTNAME,
        lastName: process.env.SUPERUSER_LASTNAME,
        password: process.env.SUPERUSER_PASSWORD,
      });
      this.superuser = superuser;
    } catch (err) {
      throw new Error(err);
    }
  }

  private async seedUsers() {
    console.log('🌱 Seeding users...');
    try {
      for (let i = 0; i < SEED_USERS_COUNT; i++) {
        const user = await this.userRepo.create({
          email: faker.internet.email(),
          firstName: faker.name.firstName(),
          lastName: faker.name.lastName(),
          password: process.env.SEED_USER_PASSWORD,
        });
        this.users.push(user);
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  private async seedFollowRelationships() {
    console.log('🌱 Following each other...');
    try {
      for (let i = 0; i < this.users.length; i++) {
        const user = this.users[i];
        const otherUsers = faker.random.arrayElements(
          this.users.filter((_, index) => index !== i),
          Math.max(12, faker.random.number(this.users.length - 1)),
        );
        for (let j = 0; j < otherUsers.length - 1; j++) {
          const otherUser = otherUsers[j];
          await this.userService.follow(user, { slug: otherUser.slug });
        }
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  private async seedTrip() {
    console.log('🌱 Seeding trip...');
    try {
      const { tripId } = await this.tripService.createTrip(this.superuser, {
        ...EXAMPLE_TRIP,
      });
      this.tripId = tripId;
    } catch (err) {
      throw new Error(err);
    }
  }

  private async seedSteps() {
    console.log('🌱 Seeding steps...');
    try {
      for (let i = 0; i < EXAMPLE_STEPS.length; i++) {
        const step = await this.stepRepo.create({
          tripId: this.tripId,
          ...EXAMPLE_STEPS[i],
          traveler: this.superuser,
        });
        await this.stepRepo.save(step);
        this.steps.push(step);
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  private async seedLikes() {
    console.log('🌱 Seeding likes...');
    try {
      for (let i = 0; i < this.users.length; i++) {
        const targetSteps = faker.random.arrayElements(this.steps, 2);
        for (let j = 0; j < targetSteps.length; j++) {
          const step = await this.stepRepo.findOne({
            where: { id: targetSteps[j].id },
          });
          const like = await this.likeRepo.create({
            user: this.users[i],
            step,
          });
          await this.likeRepo.save(like);
        }
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  private async seedComments() {
    console.log('🌱 Seeding comments...');
    try {
      for (let i = 0; i < this.users.length; i++) {
        const targetSteps = [this.steps[0], this.steps[this.steps.length - 1]];
        for (let j = 0; j < targetSteps.length - 1; j++) {
          const comment = this.commentRepo.create({
            creator: this.users[i],
            text: faker.lorem.sentences(faker.random.number(3)),
          });
          await this.commentRepo.save(comment);
        }
      }
    } catch (err) {
      throw new Error(err);
    }
  }
}
