import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { Users } from '../entities/user.entity';

@InputType()
export class CreateAccountInput extends PickType(Users, [
  'email',
  'password',
  'firstName',
  'lastName',
]) {}

@ObjectType()
export class CreateAccountOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
