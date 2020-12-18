import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { Step } from 'src/step/entities/step.entity';
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

@InputType('CommentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Comment {
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
  text: string;

  // user
  @Field(() => Users)
  @ManyToOne(() => Users, (user) => user.comments)
  creator: Users;

  @RelationId((comment: Comment) => comment.creator)
  creatorId: number;

  // step
  @Field(() => Step)
  @ManyToOne(() => Step, (step) => step.comments)
  step: Step;

  @RelationId((comment: Comment) => comment.step)
  stepId: number;
}
