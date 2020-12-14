import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { string } from 'joi';
import { Trip } from '../entities/trip.entity';

@InputType()
export class CreateTripInput extends PickType(Trip, [
  'name',
  'startDate',
  'endDate',
  'coverUrl',
  'availability',
  'summary',
]) {}

@ObjectType()
export class CreateTripOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
