import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
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

  @UseGuards(AuthGuard)
  @Mutation(() => CreateCommentOutput)
  createComment(
    @AuthUser() user: Users,
    @Args('input') createCommentInput: CreateCommentInput,
  ): Promise<CreateCommentOutput> {
    return this.commentService.createComment(user, createCommentInput);
  }

  @Query(() => ReadCommentsOutput)
  readComments(
    @Args('input') readCommentsInput: ReadCommentsInput,
  ): Promise<ReadCommentsOutput> {
    return this.commentService.readComments(readCommentsInput);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => DeleteCommentOutput)
  deleteComment(
    @AuthUser() user: Users,
    @Args('input') deleteCommentInput: DeleteCommentInput,
  ): Promise<DeleteCommentOutput> {
    return this.commentService.deleteComment(user, deleteCommentInput);
  }
}
