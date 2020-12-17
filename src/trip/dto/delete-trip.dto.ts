import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { Trip } from '../entities/trip.entity';

@InputType()
export class DeleteTripInput {
  @Field(() => Int)
  tripId: number;
}

@ObjectType()
export class DeleteTripOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String)
  error: string;
}
