import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Comment } from '../entities/comment.entity';

@InputType()
export class ReadCommentsInput {
  @Field(() => Number)
  @IsNumber()
  stepId: number;
}

@ObjectType()
export class ReadCommentsOutput extends CoreOutput {
  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];
}
