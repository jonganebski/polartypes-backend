import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsDate, IsString, IsUrl } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

type Availability = 'only me' | 'my followers' | 'public';

@InputType('TripInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Trip {
  @Field(() => Number)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Date)
  @Column()
  @IsDate()
  startDate: Date;

  @Field(() => Date, { nullable: true })
  @Column({ nullable: true })
  @IsDate()
  endDate: Date;

  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  summary: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsUrl()
  coverUrl: string;

  @Field(() => String)
  @Column()
  availability: Availability;

  // creator

  // steps
}
