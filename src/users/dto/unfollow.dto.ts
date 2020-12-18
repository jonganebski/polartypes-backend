import { InputType, ObjectType } from '@nestjs/graphql';
import { FollowInput, FollowOutput } from './follow.dto';

@InputType()
export class UnfollowInput extends FollowInput {}

@ObjectType()
export class UnfollowOutput extends FollowOutput {}
