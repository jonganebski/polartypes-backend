import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Comment } from '../entities/comment.entity';

@InputType()
export class CreateCommentInput extends PickType(Comment, ['text']) {
  @Field(() => Number)
  @IsNumber()
  stepId: number;
}

@ObjectType()
export class CreateCommentOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  commentId?: number;
}
