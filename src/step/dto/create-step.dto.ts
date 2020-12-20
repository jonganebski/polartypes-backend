import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
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
  @Field(() => Int)
  tripId: number;

  @Field(() => String, { nullable: true })
  story?: string;
}

@ObjectType()
export class CreateStepOutput extends CoreOutput {}
