import {
  Field,
  InputType,
  ObjectType,
  PartialType,
  PickType,
} from '@nestjs/graphql';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';
import { PW_MIN_LENGTH } from '../user.contants';

@InputType()
export class UpdateAccountInput extends PartialType(
  PickType(Users, [
    'about',
    'avatarUrl',
    'city',
    'firstName',
    'lastName',
    'password',
    'slug',
    'username',
    'timeZone',
  ]),
) {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(PW_MIN_LENGTH)
  newPassword?: string;
}

@ObjectType()
export class UpdateAccountOutput extends CoreOutput {}
