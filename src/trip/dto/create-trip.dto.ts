import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Trip } from '../entities/trip.entity';

@InputType()
export class CreateTripInput extends PickType(Trip, [
  'name',
  'startDate',
  'availability',
]) {
  @Field(() => String, { nullable: true })
  summary?: string;

  @Field(() => Int, { nullable: true })
  endUnix?: number;
}

@ObjectType()
export class CreateTripOutput extends CoreOutput {}
