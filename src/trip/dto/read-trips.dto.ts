import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Users } from 'src/users/entities/user.entity';

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

  @Field(() => Users, { nullable: true })
  targetUser?: Users;
}
