import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Comment } from '../entities/comment.entity';

@InputType()
export class ReadCommentsInput {
  @Field(() => Int)
  stepId: number;
}

@ObjectType()
export class ReadCommentsOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];
}
