import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@InputType()
export class CreateImageInput {
  @Field(() => Int)
  stepId: number;

  @Field(() => String)
  url: string;
}

@ObjectType()
export class CreateImageOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
