import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Trip } from '../entities/trip.entity';

@InputType()
export class UpdateTripInput extends PartialType(Trip) {
  @Field(() => Number)
  @IsNumber()
  tripId: number;
}

@ObjectType()
export class UpdateTripOutput extends CoreOutput {}
