import { Field, InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Step } from '../entities/step.entity';

@InputType()
export class ToggleLikeInput extends PickType(Step, ['id']) {}

@ObjectType()
export class ToggleLikeOutput extends CoreOutput {
  @Field(() => Number, { nullable: true })
  toggle?: number;
}
