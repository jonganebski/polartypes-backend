import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Like } from '../entities/like.entity';

@ObjectType()
export class LikesInfoOutput {
  @Field(() => [Like])
  samples: Like[];

  @Field(() => Int)
  totalCount: number;
}
