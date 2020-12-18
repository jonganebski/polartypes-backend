import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Step } from '../entities/step.entity';

@InputType()
export class CreateStepInput extends PickType(Step, [
  'name',
  'photoUrls',
  'country',
  'coord',
  'arrivedAt',
  'timeZone',
]) {
  @Field(() => Int)
  tripId: number;

  @Field(() => String, { nullable: true })
  story?: string;
}

@ObjectType()
export class CreateStepOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
