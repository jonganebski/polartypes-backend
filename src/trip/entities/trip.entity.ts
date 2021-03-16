import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import {
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Step } from 'src/step/entities/step.entity';
import { Users } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, OneToMany, RelationId } from 'typeorm';

export enum Availability {
  Private = 'Private',
  Followers = 'Followers',
  Public = 'Public',
}

registerEnumType(Availability, { name: 'Availability' });

@InputType('TripInputType', { isAbstract: true })
@ObjectType() // 자동으로 스키마를 빌드하기 위한 GraphQL decorator
@Entity() // TypeORM이 database에 저장할 수 있도록 하는 decorator
export class Trip extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsISO8601({ strict: true })
  startDate: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @Field(() => String)
  @Column()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  summary?: string;

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsUrl()
  coverUrl?: string;

  @Field(() => Availability)
  @Column({ type: 'enum', enum: Availability })
  availability: Availability;

  @Field(() => Number, { defaultValue: 0 })
  @Column({ default: 0 })
  @IsNumber()
  viewCount: number;

  // creator
  @Field(() => Users)
  @ManyToOne(() => Users, (user) => user.trips, { onDelete: 'CASCADE' })
  traveler: Users;

  @RelationId((trip: Trip) => trip.traveler)
  travelerId: number;

  // steps
  @Field(() => [Step])
  @OneToMany(() => Step, (step) => step.trip)
  steps: Step[];
}
