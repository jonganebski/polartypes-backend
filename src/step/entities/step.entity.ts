import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsArray, IsISO8601, IsNumber, IsString, IsUrl } from 'class-validator';
import { Comment } from 'src/comment/entities/comment.entity';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Trip } from 'src/trip/entities/trip.entity';
import { Users } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';
import { Like } from './like.entity';

@InputType('StepInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Step extends CoreEntity {
  @Field(() => String)
  @Column()
  location: string;

  @Field(() => String)
  @Column()
  @IsString()
  country: string;

  @Field(() => Number)
  @Column({ type: 'float' })
  @IsNumber()
  lat: number;

  @Field(() => Number)
  @Column({ type: 'float' })
  @IsNumber()
  lon: number;

  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => String)
  @Column()
  @IsISO8601({ strict: true })
  arrivedAt: string;

  @Field(() => String)
  @Column()
  @IsString()
  timeZone: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  story?: string;

  @Field(() => [String], { nullable: true })
  @Column('text', { array: true, nullable: true })
  @IsArray()
  @IsUrl({}, { each: true })
  imgUrls?: string[];

  // likes
  @Field(() => [Like])
  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  // comments
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
