import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';

@InputType()
export class ReadFollowersInput {
  @Field(() => Number)
  @IsNumber()
  targetUserId: number;
}

@ObjectType()
export class ReadFollowersOutput extends CoreOutput {
  @Field(() => [Users], { nullable: true })
  followers?: Users[];
}
