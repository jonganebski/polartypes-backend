import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Step } from '../entities/step.entity';

@InputType()
export class ToggleLikeInput extends PickType(Step, ['id']) {}

@ObjectType()
export class ToggleLikeOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
