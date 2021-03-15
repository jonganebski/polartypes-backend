import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsNumber, IsOptional } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Step } from 'src/step/entities/step.entity';
import { Comment } from '../entities/comment.entity';

@InputType()
export class ListCommentsInput {
  @Field(() => Number)
  @IsNumber()
  stepId: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  cursorId?: number;
}

@ObjectType()
export class ListCommentsOutput extends CoreOutput {
  @Field(() => Step, { nullable: true })
  step?: Pick<Step, 'id' | 'comments'>;

  @Field(() => Int, { nullable: true })
  endCursorId?: number;

  @Field(() => Boolean, { nullable: true })
  hasMorePages?: boolean;
}
