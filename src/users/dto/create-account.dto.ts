import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';

@InputType()
export class CreateAccountInput extends PickType(Users, [
  'email',
  'password',
  'firstName',
  'lastName',
]) {}

@ObjectType()
export class CreateAccountOutput extends CoreOutput {}
