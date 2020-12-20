import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Step } from 'src/step/entities/step.entity';
import { Users } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, RelationId } from 'typeorm';

@InputType('CommentInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Comment extends CoreEntity {
  @Field(() => String)
  @Column()
  @IsString()
  text: string;

  // user
  @Field(() => Users)
  @ManyToOne(() => Users, (user) => user.comments, { onDelete: 'CASCADE' })
  creator: Users;

  @RelationId((comment: Comment) => comment.creator)
  creatorId: number;

  // step
  @Field(() => Step)
  @ManyToOne(() => Step, (step) => step.comments, { onDelete: 'CASCADE' })
  step: Step;

  @RelationId((comment: Comment) => comment.step)
  stepId: number;
}
