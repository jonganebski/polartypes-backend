import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Comment } from '../entities/comment.entity';

@InputType()
export class ReadCommentsInput {
  @Field(() => Int)
  stepId: number;
}

@ObjectType()
export class ReadCommentsOutput extends CoreOutput {
  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];
}
