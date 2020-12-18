import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';

@InputType()
export class DeleteImagesInput {
  @Field(() => Int)
  stepId: number;

  @Field(() => [Int])
  imageIds: number[];
}

@ObjectType()
export class DeleteImagesOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
