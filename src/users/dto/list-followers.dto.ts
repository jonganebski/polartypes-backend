import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';

@InputType()
export class ListFollowersInput {
  @Field(() => String)
  @IsString()
  slug: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  cursorId?: number;
}

@ObjectType()
export class ListFollowersOutput extends CoreOutput {
  @Field(() => Users, { nullable: true })
  user?: Pick<Users, 'id' | 'slug' | 'followers'>;

  @Field(() => Int, { nullable: true })
  endCursorId?: number;

  @Field(() => Boolean, { nullable: true })
  hasNextPage?: boolean;
}
