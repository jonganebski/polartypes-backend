import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { IsNumber, IsString } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Step } from '../entities/step.entity';

@InputType()
export class CreateStepInput extends PickType(Step, [
  'name',
  'country',
  'coord',
  'arrivedAt',
  'timeZone',
]) {
  @Field(() => Number)
  @IsNumber()
  tripId: number;

  @Field(() => String, { nullable: true })
  @IsString()
  story?: string;
}

@ObjectType()
export class CreateStepOutput extends CoreOutput {}
