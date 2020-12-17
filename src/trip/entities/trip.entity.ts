import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsNumber, IsString, IsUrl } from 'class-validator';
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

export enum Availability {
  Private,
  Followers,
  Public,
}

registerEnumType(Availability, { name: 'Availability' });

@InputType('TripInputType', { isAbstract: true })
@ObjectType() // 자동으로 스키마를 빌드하기 위한 GraphQL decorator
@Entity() // TypeORM이 database에 저장할 수 있도록 하는 decorator
export class Trip {
  @Field(() => Number) // Field fot graphql schema
  @PrimaryGeneratedColumn() // column for typeORM
  id: number;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => Date)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field(() => Int)
  @Column()
  @IsNumber()
  startUnix: number; // unix in seconds.

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  @IsNumber()
  endUnix?: number; // unix in seconds.

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

  // creator
  @Field(() => Users)
  @ManyToOne(() => Users, (user) => user.trip)
  traveler: Users;

  @RelationId((trip: Trip) => trip.traveler)
  travelerId: number;

  // steps
}
