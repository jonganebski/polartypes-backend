import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsArray, IsNumber, IsString } from 'class-validator';
import { Trip } from 'src/trip/entities/trip.entity';
import { Users } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';

@InputType('StepInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Step {
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
  @Column()
  @IsString()
  country: string;

  @Field(() => [Number])
  @Column({ type: 'float', array: true })
  @IsArray()
  coord: number[];

  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => Int)
  @Column()
  @IsNumber()
  arrivedAt: number;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  story?: string;

  @Field(() => [String])
  @Column({ type: 'text', array: true })
  @IsArray()
  photoUrls: string[];

  // liked users

  // cooments

  // user
  @Field(() => Users)
  @ManyToOne(() => Users, (user) => user.steps)
  traveler: Users;

  @RelationId((step: Step) => step.traveler)
  travelerId: number;

  // trip
  @Field(() => Trip)
  @ManyToOne(() => Trip, (trip) => trip.steps)
  trip: Trip;

  @RelationId((step: Step) => step.trip)
  tripId: number;
}
