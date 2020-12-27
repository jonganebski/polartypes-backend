import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';

@InputType()
export class DeleteStepInput {
  @Field(() => Number)
  @IsNumber()
  stepId: number;
}

@ObjectType()
export class DeleteStepOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  stepId?: number;
}
