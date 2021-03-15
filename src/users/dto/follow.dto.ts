import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';

@InputType()
export class FollowInput extends PickType(Users, ['slug']) {}

@ObjectType()
export class FollowOutput extends CoreOutput {
  @Field(() => String, { nullable: true })
  slug?: string;
}
