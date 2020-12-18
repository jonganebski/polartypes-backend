import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Trip } from '../entities/trip.entity';

@InputType()
export class ReadTripsInput {
  @Field(() => String)
  targetUsername: string;
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
