import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsArray, IsDate, IsString } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
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
  @Column()
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

  @Field(() => String, { nullable: true })
  @Column({ nullable: true })
  @IsString()
  story: string;

  @Field(() => [String])
  @Column()
  @IsArray()
  photoUrls: string[];

  // liked users

  // cooments

  // trip
}
