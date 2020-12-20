import {
  Field,
  InputType,
  Int,
  ObjectType,
  PartialType,
} from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Trip } from '../entities/trip.entity';

@InputType()
export class UpdateTripInput extends PartialType(Trip) {
  @Field(() => Int)
  tripId: number;
}

@ObjectType()
export class UpdateTripOutput extends CoreOutput {}
