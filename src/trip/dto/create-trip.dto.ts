import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsDate, IsString } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Trip } from '../entities/trip.entity';

@InputType()
export class CreateTripInput extends PickType(Trip, [
  'name',
  'startDate',
  'availability',
]) {
  @Field(() => String, { nullable: true })
  @IsString()
  summary?: string;

  @Field(() => Date, { nullable: true })
  @IsDate()
  endDate?: Date;
}

@ObjectType()
export class CreateTripOutput extends CoreOutput {}
