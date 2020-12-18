import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Comment } from '../entities/comment.entity';

@InputType()
export class CreateCommentInput extends PickType(Comment, ['text']) {
  @Field(() => Int)
  stepId: number;
}

@ObjectType()
export class CreateCommentOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
