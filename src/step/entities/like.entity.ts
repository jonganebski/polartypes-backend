import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { Users } from 'src/users/entities/user.entity';
import { Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { Step } from './step.entity';

@InputType('LikeInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Like {
  @Field(() => Number)
  @PrimaryColumn()
  @IsNumber()
  userId: number;

  @Field(() => Number)
  @PrimaryColumn()
  @IsNumber()
  stepId: number;

  @Field(() => Users)
  @ManyToOne(() => Users, (user) => user.likes, { onDelete: 'CASCADE' })
  user: Users;

  @Field(() => Step)
  @ManyToOne(() => Step, (step) => step.likes, { onDelete: 'CASCADE' })
  step: Step;
}
