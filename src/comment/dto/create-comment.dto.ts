import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Comment } from '../entities/comment.entity';

@InputType()
export class CreateCommentInput extends PickType(Comment, ['text']) {
  @Field(() => Int)
  stepId: number;
}

@ObjectType()
export class CreateCommentOutput extends CoreOutput {}
