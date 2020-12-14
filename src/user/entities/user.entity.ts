import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString, IsUrl } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User {
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

  @Field(() => String)
  @Column()
  @IsUrl()
  avatarUrl: string;

  @Field(() => String)
  @Column()
  @IsString()
  city: string;

  @Field(() => String)
  @Column()
  @IsString()
  timeZone: string;

  // trips

  // followers

  // followings

  // comments

  // likes
}
