import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Access } from 'src/auth/access.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Users } from 'src/users/entities/user.entity';
import { CommentService } from './comment.service';
import {
  CreateCommentInput,
  CreateCommentOutput,
} from './dto/create-comment.dto';
import {
  DeleteCommentInput,
  DeleteCommentOutput,
} from './dto/delete-comment.dto';
import { ReadCommentsInput, ReadCommentsOutput } from './dto/read-comments.dto';

@Resolver()
export class CommentResolver {
  constructor(private readonly commentService: CommentService) {}

  @Access('Signedin')
  @Mutation(() => CreateCommentOutput)
  createComment(
    @AuthUser() user: Users,
    @Args('input') createCommentInput: CreateCommentInput,
  ): Promise<CreateCommentOutput> {
    return this.commentService.createComment(user, createCommentInput);
  }

  @Access('Any')
  @Query(() => ReadCommentsOutput)
  readComments(
    @Args('input') readCommentsInput: ReadCommentsInput,
  ): Promise<ReadCommentsOutput> {
    return this.commentService.readComments(readCommentsInput);
  }

  @Access('Signedin')
  @Mutation(() => DeleteCommentOutput)
  deleteComment(
    @AuthUser() user: Users,
    @Args('input') deleteCommentInput: DeleteCommentInput,
  ): Promise<DeleteCommentOutput> {
    return this.commentService.deleteComment(user, deleteCommentInput);
  }
}
