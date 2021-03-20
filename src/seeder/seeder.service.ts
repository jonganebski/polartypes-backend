import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as faker from 'faker';
import { Comment } from 'src/comment/entities/comment.entity';
import { Like } from 'src/step/entities/like.entity';
import { Step } from 'src/step/entities/step.entity';
import { Trip } from 'src/trip/entities/trip.entity';
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
    @InjectRepository(Trip) private readonly tripRepo: Repository<Trip>,
    @InjectRepository(Step) private readonly stepRepo: Repository<Step>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    private readonly userService: UserService,
  ) {}
  private superuser: Users;
  private steps: Step[] = [];
  private users: Users[] = [];
  private trip: Trip;

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
      console.error('❌ Seeding aborted.', err);
    }
  }

  private async seedSuperUser() {
    console.log('🌱 Seeding superuser...');
    try {
      const firstName = process.env.SUPERUSER_FIRSTNAME;
      const lastName = process.env.SUPERUSER_LASTNAME;
      const username = firstName + lastName;
      const slug = username.toLowerCase();

      const existSuperuser = await this.userRepo.findOne({ where: { slug } });
      if (existSuperuser) {
        throw new Error('🤖 Superuser already exists. Abort seeding...');
      }

      const created = await this.userRepo.create({
        email: process.env.SUPERUSER_EMAIL,
        firstName,
        lastName,
        username,
        slug,
        city: 'Seoul',
        about: "I'm a developer of this site.",
        timeZone: process.env.SUPERUSER_TIMEZONE,
        password: process.env.SUPERUSER_PASSWORD,
      });
      const superuser = await this.userRepo.save(created);
      this.superuser = superuser;
      this.users.push(superuser);
    } catch (err) {
      throw new Error(err);
    }
  }

  private async seedUsers() {
    console.log('🌱 Seeding users...');
    try {
      for (let i = 0; i < SEED_USERS_COUNT; i++) {
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const username = firstName + lastName;
        const slug = username.toLowerCase();
        const created = await this.userRepo.create({
          email: faker.internet.email(),
          firstName,
          lastName,
          username,
          slug,
          about: faker.lorem.sentences(faker.random.number({ min: 0, max: 3 })),
          timeZone: faker.address.timeZone(),
          city: faker.address.city(),
          password: process.env.SEED_USER_PASSWORD,
        });
        const user = await this.userRepo.save(created);
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
          faker.random.number({ min: 12, max: this.users.length - 1 }),
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
      const created = await this.tripRepo.create({
        ...EXAMPLE_TRIP,
        traveler: this.superuser,
      });
      const trip = await this.tripRepo.save(created);
      this.trip = trip;
    } catch (err) {
      throw new Error(err);
    }
  }

  private async seedSteps() {
    console.log('🌱 Seeding steps...');
    try {
      for (let i = 0; i < EXAMPLE_STEPS.length; i++) {
        const created = await this.stepRepo.create({
          traveler: this.superuser,
          trip: this.trip,
          ...EXAMPLE_STEPS[i],
        });
        const step = await this.stepRepo.save(created);
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
        const targetSteps = faker.random.arrayElements(this.steps, 5);
        for (let j = 0; j < targetSteps.length; j++) {
          const like = await this.likeRepo.create({
            user: this.users[i],
            step: targetSteps[j],
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
        const targetSteps = faker.random.arrayElements(
          this.steps,
          faker.random.number({
            min: Math.round(this.steps.length * 0.2),
            max: Math.round(this.steps.length * 0.5),
          }),
        );
        for (let j = 0; j < targetSteps.length - 1; j++) {
          const comment = this.commentRepo.create({
            text: faker.lorem.sentences(
              faker.random.number({ min: 1, max: 3 }),
            ),
            createdAt: faker.date.recent(
              faker.random.number({ min: 1, max: 100 }),
            ),
            creator: this.users[i],
            step: targetSteps[j],
          });
          await this.commentRepo.save(comment);
        }
      }
    } catch (err) {
      throw new Error(err);
    }
  }
}
