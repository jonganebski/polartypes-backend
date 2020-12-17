import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Step } from '../entities/step.entity';

@InputType()
export class ReadStepsInput {
  @Field(() => Int)
  tripId: number;
}

@ObjectType()
export class ReadStepsOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => [Step], { nullable: true })
  steps?: Step[];
}
