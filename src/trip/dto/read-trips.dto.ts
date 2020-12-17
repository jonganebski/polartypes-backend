import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Trip } from '../entities/trip.entity';

@InputType()
export class ReadTripsInput {
  @Field(() => Int)
  targetUserId: number;
}

@ObjectType()
export class ReadTripsOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => [Trip], { nullable: true })
  trips?: Trip[];
}
