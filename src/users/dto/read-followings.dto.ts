import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { Users } from '../entities/user.entity';

@InputType()
export class ReadFollowingsInput {
  @Field(() => Int)
  targetUserId: number;
}

@ObjectType()
export class ReadFollowingsOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => [Users], { nullable: true })
  followings?: Users[];
}
