import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';

@InputType()
export class ReadFollowersInput {
  @Field(() => Int)
  targetUserId: number;
}

@ObjectType()
export class ReadFollowersOutput extends CoreOutput {
  @Field(() => [Users], { nullable: true })
  followers?: Users[];
}
