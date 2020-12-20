import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';

@InputType()
export class DeleteStepInput {
  @Field(() => Int)
  stepId: number;
}

@ObjectType()
export class DeleteStepOutput extends CoreOutput {}
