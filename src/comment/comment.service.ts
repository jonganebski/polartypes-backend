import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Step } from 'src/step/entities/step.entity';
import { Users } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateCommentInput,
  CreateCommentOutput,
} from './dto/create-comment.dto';
import {
  DeleteCommentInput,
  DeleteCommentOutput,
} from './dto/delete-comment.dto';
import { ListCommentsInput, ListCommentsOutput } from './dto/list-comments.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Step) private readonly stepRepo: Repository<Step>,
  ) {}

  async createComment(
    user: Users,
    createCommentInput: CreateCommentInput,
  ): Promise<CreateCommentOutput> {
    try {
      const step = await this.stepRepo.findOne({
        id: createCommentInput.stepId,
      });
      if (!step) {
        return { ok: false, error: 'Step not found.' };
      }
      const comment = await this.commentRepo.create(createCommentInput);
      comment.creator = user;
      comment.step = step;
      const savedComment = await this.commentRepo.save(comment);
      return { ok: true, commentId: savedComment.id };
    } catch {
      return { ok: false, error: 'Failed to create comment.' };
    }
  }

  async listComments({
    cursorId,
    stepId,
  }: ListCommentsInput): Promise<ListCommentsOutput> {
    try {
      const take = 10;
      const [comments, count] = await this.commentRepo
        .createQueryBuilder('comment')
        .leftJoin('comment.step', 'step')
        .where('step.id = :id', { id: stepId })
        .andWhere('comment.id < :cursorId', {
          cursorId: cursorId ?? Math.pow(2, 31) - 1,
        })
        .leftJoinAndSelect('comment.creator', 'creator')
        .orderBy('comment.createdAt', 'DESC')
        .take(take)
        .getManyAndCount();

      return {
        ok: true,
        step: { id: stepId, comments },
        endCursorId: comments[comments.length - 1]?.id ?? null,
        hasMorePages: 0 < count - take,
      };
    } catch (err) {
      console.log(err);
      return { ok: false, error: 'Failed to load comments.' };
    }
  }

  async deleteComment(
    user: Users,
    { id }: DeleteCommentInput,
  ): Promise<DeleteCommentOutput> {
    try {
      const comment = await this.commentRepo.findOne(id);
      if (!comment) {
        return { ok: false, error: 'Comment not found.' };
      }
      if (comment.creatorId !== user.id) {
        return { ok: false, error: 'Not authorized.' };
      }
      const deleteResult = await this.commentRepo.delete({ id });
      if (deleteResult.affected === 0) {
        return { ok: false, error: 'Failed to delete comment.' };
      }
      return { ok: true };
    } catch {
      return { ok: false, error: 'Failed to delete comment.' };
    }
  }
}
