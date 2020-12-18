import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsArray, IsDate, IsString } from 'class-validator';
import { Comment } from 'src/comment/entities/comment.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { Users } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
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

  @Field(() => Date)
  @Column()
  @IsDate()
  arrivedAt: Date;

  @Field(() => String)
  @Column()
  @IsString()
  timeZone: string;

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
  @Field(() => [Comment])
  @OneToMany(() => Comment, (comment) => comment.step)
  comments: Comment[];

  // user
  @Field(() => Users)
  @ManyToOne(() => Users, (user) => user.steps, { onDelete: 'CASCADE' })
  traveler: Users;

  @RelationId((step: Step) => step.traveler)
  travelerId: number;

  // trip
  @Field(() => Trip)
  @ManyToOne(() => Trip, (trip) => trip.steps, { onDelete: 'CASCADE' })
  trip: Trip;

  @RelationId((step: Step) => step.trip)
  tripId: number;
}
