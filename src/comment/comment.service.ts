import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { COMMENT_ERR } from 'src/errors/comment.errors';
import { COMMON_ERR } from 'src/errors/common.errors';
import { STEP_ERR } from 'src/errors/step.errors';
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
        return { ok: false, error: STEP_ERR.StepNotFound };
      }
      const comment = this.commentRepo.create(createCommentInput);
      comment.creator = user;
      comment.step = step;
      const savedComment = await this.commentRepo.save(comment);
      return { ok: true, commentId: savedComment.id };
    } catch {
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async listComments({
    stepId,
    cursorDate,
  }: ListCommentsInput): Promise<ListCommentsOutput> {
    try {
      const take = 10;
      const [comments, count] = await this.commentRepo
        .createQueryBuilder('comment')
        .leftJoin('comment.step', 'step')
        .where('step.id = :id', { id: stepId })
        .andWhere('comment.createdAt < :cursorDate', {
          cursorDate: cursorDate ?? new Date(),
        })
        .leftJoinAndSelect('comment.creator', 'creator')
        .orderBy('comment.createdAt', 'DESC')
        .take(take)
        .getManyAndCount();

      return {
        ok: true,
        step: { id: stepId, comments },
        endCursorDate: comments[comments.length - 1]?.createdAt ?? null,
        hasNextPage: 0 < count - take,
      };
    } catch (err) {
      console.error(err);
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async deleteComment(
    user: Users,
    { id }: DeleteCommentInput,
  ): Promise<DeleteCommentOutput> {
    try {
      const comment = await this.commentRepo.findOne(id);
      if (!comment) {
        return { ok: false, error: COMMENT_ERR.CommentNotFound };
      }
      if (comment.creatorId !== user.id) {
        return { ok: false, error: COMMON_ERR.NotAuthorized };
      }
      const deleteResult = await this.commentRepo.delete({ id });
      if (deleteResult.affected === 0) {
        throw new Error();
      }
      return { ok: true };
    } catch {
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }
}
