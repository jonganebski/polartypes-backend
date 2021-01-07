import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from 'src/users/entities/user.entity';
import { Trip } from '../entities/trip.entity';

@InputType()
export class SearchInput {
  @Field(() => String)
  @IsString()
  @MinLength(3)
  searchTerm: string;
}

@ObjectType()
export class SearchOutput extends CoreOutput {
  @Field(() => [Users], { nullable: true })
  users?: Users[];

  @Field(() => Number, { nullable: true })
  usersCount?: number;

  @Field(() => [Trip], { nullable: true })
  trips?: Trip[];

  @Field(() => Number, { nullable: true })
  tripsCount?: number;
}
