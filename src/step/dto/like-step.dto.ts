import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Step } from '../entities/step.entity';

@InputType()
export class LikeStepInput extends PickType(Step, ['id']) {}

@ObjectType()
export class LikeStepOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
