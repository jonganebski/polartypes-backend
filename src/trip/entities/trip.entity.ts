import {
  Field,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { IsDate, IsString, IsUrl } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

enum Availability {
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

  @Field(() => Availability)
  @Column({ type: 'enum', enum: Availability })
  availability: Availability;

  // creator

  // steps
}
