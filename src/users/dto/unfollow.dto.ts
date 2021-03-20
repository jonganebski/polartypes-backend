import { Field, InputType, Int, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';

@InputType()
export class UnfollowInput extends PickType(Users, ['slug']) {}

@ObjectType()
export class UnfollowOutput extends CoreOutput {
  @Field(() => Int, { nullable: true })
  id?: number;
}
