import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@InputType()
export class DeleteStepInput {
  @Field(() => Int)
  stepId: number;
}

@ObjectType()
export class DeleteStepOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
