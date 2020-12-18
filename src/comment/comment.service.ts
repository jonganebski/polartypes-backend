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
      await this.commentRepo.save(comment);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Failed to create comment.' };
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
      return { ok: true, error: "Not deleted. It's under development." };
    } catch {
      return { ok: false, error: 'Failed to delete comment.' };
    }
  }
}
