import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Step } from '../entities/step.entity';

@InputType()
export class UpdateStepInput extends PartialType(Step) {
  @Field(() => Int)
  stepId: number;
}

@ObjectType()
export class UpdateStepOutput extends CoreOutput {}
