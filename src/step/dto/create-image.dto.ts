import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, IsUrl } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';

@InputType()
export class CreateImageInput {
  @Field(() => Number)
  @IsString()
  stepId: number;

  @Field(() => String)
  @IsUrl()
  url: string;
}

@ObjectType()
export class CreateImageOutput extends CoreOutput {}
