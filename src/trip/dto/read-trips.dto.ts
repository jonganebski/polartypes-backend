import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from 'src/users/entities/user.entity';

@InputType()
export class ReadTripsInput {
  @Field(() => String)
  @IsString()
  slug: string;
}

@ObjectType()
export class ReadTripsOutput extends CoreOutput {
  @Field(() => Users, { nullable: true })
  targetUser?: Users;
}
