import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsArray, IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';

@InputType()
export class DeleteImagesInput {
  @Field(() => Number)
  @IsNumber()
  stepId: number;

  @Field(() => [Number])
  @IsArray()
  @IsNumber({}, { each: true })
  imageIds: number[];
}

@ObjectType()
export class DeleteImagesOutput extends CoreOutput {}
