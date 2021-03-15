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
import { ListCommentsInput, ListCommentsOutput } from './dto/list-comments.dto';

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
  @Query(() => ListCommentsOutput)
  listComments(
    @Args('input') listCommentsInput: ListCommentsInput,
  ): Promise<ListCommentsOutput> {
    return this.commentService.listComments(listCommentsInput);
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
