import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';

@InputType()
export class UnfollowInput extends PickType(Users, ['id']) {}

@ObjectType()
export class UnfollowOutput extends CoreOutput {}
