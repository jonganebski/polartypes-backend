import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Trip } from 'src/trip/entities/trip.entity';

@InputType()
export class ReadTripInput {
  @Field(() => Number)
  @IsNumber()
  tripId: number;
}

@ObjectType()
export class ReadTripOutput extends CoreOutput {
  @Field(() => Trip, { nullable: true })
  trip?: Trip;
}
