import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsDate, IsNumber, IsOptional } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Step } from 'src/step/entities/step.entity';

@InputType()
export class ListCommentsInput {
  @Field(() => Int)
  @IsNumber()
  stepId: number;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  cursorDate?: Date;
}

@ObjectType()
export class ListCommentsOutput extends CoreOutput {
  @Field(() => Step, { nullable: true })
  step?: Pick<Step, 'id' | 'comments'>;

  @Field(() => Date, { nullable: true })
  endCursorDate?: Date;

  @Field(() => Boolean, { nullable: true })
  hasNextPage?: boolean;
}
