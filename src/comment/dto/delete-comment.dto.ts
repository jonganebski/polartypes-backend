import { InputType, ObjectType, PickType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dto/common-output.dto';
import { Comment } from '../entities/comment.entity';

@InputType()
export class DeleteCommentInput extends PickType(Comment, ['id']) {}

@ObjectType()
export class DeleteCommentOutput extends CoreOutput {}
