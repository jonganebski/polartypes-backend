import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';

@InputType()
export class ReadFollowingsInput {
  @Field(() => Int)
  targetUserId: number;
}

@ObjectType()
export class ReadFollowingsOutput extends CoreOutput {
  @Field(() => [Users], { nullable: true })
  followings?: Users[];
}
