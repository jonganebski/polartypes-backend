import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Trip } from 'src/trip/entities/trip.entity';

@InputType()
export class ReadTripInput {
  @Field(() => Int)
  tripId: number;
}

@ObjectType()
export class ReadTripOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => Trip, { nullable: true })
  trip?: Trip;
}
