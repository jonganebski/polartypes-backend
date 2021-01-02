import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';
import { PW_MIN_LENGTH } from '../user.contants';

@InputType()
export class UpdateAccountInput extends PartialType(Users) {
  @Field(() => String)
  @IsString()
  @MinLength(PW_MIN_LENGTH)
  newPassword: string;
}

@ObjectType()
export class UpdateAccountOutput extends CoreOutput {}
