import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';

@InputType()
export class ReadFollowingsInput {
  @Field(() => Number)
  @IsNumber()
  targetUserId: number;
}

@ObjectType()
export class ReadFollowingsOutput extends CoreOutput {
  @Field(() => [Users], { nullable: true })
  followings?: Users[];
}
