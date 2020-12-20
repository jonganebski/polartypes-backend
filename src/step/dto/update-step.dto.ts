import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Step } from '../entities/step.entity';

@InputType()
export class UpdateStepInput extends PartialType(Step) {
  @Field(() => Number)
  @IsNumber()
  stepId: number;
}

@ObjectType()
export class UpdateStepOutput extends CoreOutput {}
