import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Trip } from '../entities/trip.entity';

@InputType()
export class CreateTripInput extends PickType(Trip, [
  'name',
  'startUnix',
  'availability',
]) {
  @Field(() => String, { nullable: true })
  summary?: string;

  @Field(() => Int, { nullable: true })
  endUnix?: number;
}

@ObjectType()
export class CreateTripOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
