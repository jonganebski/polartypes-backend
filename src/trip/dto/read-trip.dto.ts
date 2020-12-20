import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Trip } from 'src/trip/entities/trip.entity';

@InputType()
export class ReadTripInput {
  @Field(() => Int)
  tripId: number;
}

@ObjectType()
export class ReadTripOutput extends CoreOutput {
  @Field(() => Trip, { nullable: true })
  trip?: Trip;
}
