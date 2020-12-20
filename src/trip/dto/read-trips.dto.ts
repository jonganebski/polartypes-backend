import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from 'src/users/entities/user.entity';

@InputType()
export class ReadTripsInput {
  @Field(() => String)
  targetUsername: string;
}

@ObjectType()
export class ReadTripsOutput extends CoreOutput {
  @Field(() => Users, { nullable: true })
  targetUser?: Users;
}
