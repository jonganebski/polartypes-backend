import { Field, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Users } from '../entities/user.entity';

@ObjectType()
export class WhoAmIOutput extends CoreOutput {
  @Field(() => Users, { nullable: true })
  user?: Users;
}
