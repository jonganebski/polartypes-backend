import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { IsBoolean, IsString } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';

@InputType()
export class LoginInput extends PickType(Users, ['password']) {
  @Field(() => String)
  @IsString()
  usernameOrEmail: string;

  @Field(() => Boolean)
  @IsBoolean()
  rememberMe: boolean;
}

@ObjectType()
export class LoginOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  token?: string;

  @Field(() => String, { nullable: true })
  username?: string;
}
