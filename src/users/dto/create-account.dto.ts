import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';
import { PW_MIN_LENGTH } from '../user.contants';

@InputType()
export class CreateAccountInput extends PickType(Users, [
  'email',
  'firstName',
  'lastName',
]) {
  @Field(() => String)
  @IsString()
  @MinLength(PW_MIN_LENGTH)
  password: string;
}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  token?: string;

  @Field(() => String, { nullable: true })
  username?: string;
}
