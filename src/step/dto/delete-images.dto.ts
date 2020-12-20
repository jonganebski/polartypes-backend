import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';

@InputType()
export class DeleteImagesInput {
  @Field(() => Int)
  stepId: number;

  @Field(() => [Int])
  imageIds: number[];
}

@ObjectType()
export class DeleteImagesOutput extends CoreOutput {}
