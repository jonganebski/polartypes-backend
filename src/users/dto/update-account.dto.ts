import { InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';

@InputType()
export class UpdateAccountInput extends PartialType(Users) {}

@ObjectType()
export class UpdateAccountOutput extends CoreOutput {}
