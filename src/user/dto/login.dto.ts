import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Users } from '../entities/user.entity';

@InputType()
export class LoginInput extends PickType(Users, ['password']) {
  @Field(() => String)
  usernameOrEmail: string;
}

@ObjectType()
export class LoginOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;

  @Field(() => String, { nullable: true })
  token?: string;
}
