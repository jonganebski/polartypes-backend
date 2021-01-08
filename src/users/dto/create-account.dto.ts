import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsString, Matches, MinLength } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';
import { PW_MIN_LENGTH } from '../user.contants';

@InputType()
export class CreateAccountInput extends PickType(Users, ['email']) {
  @Field(() => String)
  @IsString()
  @MinLength(PW_MIN_LENGTH)
  password: string;

  @Field(() => String)
  @IsString()
  @Matches(/^[a-zA-Z0-9]*$/)
  firstName: string;

  @Field(() => String)
  @IsString()
  @Matches(/^[a-zA-Z0-9]*$/)
  lastName: string;
}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  token?: string;

  @Field(() => String, { nullable: true })
  username?: string;
}
