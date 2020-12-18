import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Comment } from '../entities/comment.entity';

@InputType()
export class DeleteCommentInput extends PickType(Comment, ['id']) {}

@ObjectType()
export class DeleteCommentOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
