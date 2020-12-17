import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
} from '@nestjs/graphql';
import { Trip } from '../entities/trip.entity';

@InputType()
export class UpdateTripInput extends PartialType(Trip) {
  @Field(() => Int)
  tripId: number;
}

@ObjectType()
export class UpdateTripOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
