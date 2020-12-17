import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString, IsUrl } from 'class-validator';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as argon2 from 'argon2';
import { InternalServerErrorException } from '@nestjs/common';
import { Trip } from 'src/trip/entities/trip.entity';

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Users {
  // This table is named in plural because trying to avoid confusion with postgresql's default user table.
  @BeforeInsert()
  async hashPassword(): Promise<void> {
    try {
      this.password = await argon2.hash(this.password);
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }

  async verifyPassword(inputPassword: string): Promise<boolean> {
    try {
      if (await argon2.verify(this.password, inputPassword)) {
        return true;
      } else {
        return false;
      }
    } catch {
      return false;
    }
  }

  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => String)
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Field(() => String)
  @Column({ unique: true })
  @IsString()
  username: string;

  @Field(() => String)
  @Column({ select: false })
  @IsString()
  password: string;

  @Field(() => String)
  @Column()
  @IsString()
  firstName: string;

  @Field(() => String)
  @Column()
  @IsString()
  lastName: string;

  @Field(() => String, { nullable: true }) // just for now
  @Column({ nullable: true })
  @IsUrl()
  avatarUrl?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  city: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  timeZone: string;

  // trips
  @Field(() => [Trip])
  @OneToMany(() => Trip, (trip) => trip.traveler, { onDelete: 'CASCADE' })
  trip: Trip[];

  // followers

  @Field(() => [Users])
  @OneToMany(() => Users, (user) => user.followings)
  followers: Users[];

  // followings
  @Field(() => [Users])
  @OneToMany(() => Users, (user) => user.followers)
  followings: Users[];
  // comments

  // likes
}
