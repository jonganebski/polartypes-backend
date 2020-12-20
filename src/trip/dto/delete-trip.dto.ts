import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';

@InputType()
export class DeleteTripInput {
  @Field(() => Int)
  tripId: number;
}

@ObjectType()
export class DeleteTripOutput extends CoreOutput {}
