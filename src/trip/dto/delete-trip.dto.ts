import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';

@InputType()
export class DeleteTripInput {
  @Field(() => Number)
  @IsNumber()
  tripId: number;
}

@ObjectType()
export class DeleteTripOutput extends CoreOutput {}
