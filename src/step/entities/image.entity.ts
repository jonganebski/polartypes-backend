import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsUrl } from 'class-validator';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Step } from './step.entity';

@InputType('ImageInputType')
@ObjectType()
@Entity()
export class Image {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field(() => Date)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @Column()
  @IsUrl()
  url: string;

  // step
  @Field(() => Step)
  @ManyToOne(() => Step, (step) => step.images, { onDelete: 'CASCADE' })
  step: Step;

  @RelationId((image: Image) => image.step)
  stepId: number;
}
