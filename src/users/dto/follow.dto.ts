import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';

@InputType()
export class FollowInput extends PickType(Users, ['id']) {}

@ObjectType()
export class FollowOutput extends CoreOutput {}
