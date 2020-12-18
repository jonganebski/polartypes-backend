import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { Users } from '../entities/user.entity';

@InputType()
export class UpdateAccountInput extends PartialType(Users) {}

@ObjectType()
export class UpdateAccountOutput {
  @Field(() => Boolean)
  ok: boolean;

  @Field(() => String, { nullable: true })
  error?: string;
}
