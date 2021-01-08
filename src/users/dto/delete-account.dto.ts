import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';

@InputType()
export class DeleteAccountInput {
  @Field(() => String, { nullable: true })
  password?: string; // this should be required field later
}

@ObjectType()
export class DeleteAccountoutput extends CoreOutput {}
