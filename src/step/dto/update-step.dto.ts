import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
} from '@nestjs/graphql';
import { Step } from '../entities/step.entity';

@InputType()
export class UpdateStepInput extends PartialType(Step) {
  @Field(() => Int)
  stepId: number;
}

@ObjectType()
export class UpdateStepOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
