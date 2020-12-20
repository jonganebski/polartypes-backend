import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';

@InputType()
export class CreateImageInput {
  @Field(() => Int)
  stepId: number;

  @Field(() => String)
  url: string;
}

@ObjectType()
export class CreateImageOutput extends CoreOutput {}
