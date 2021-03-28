import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { COMMENT_ERR } from 'src/errors/comment.errors';
import { COMMON_ERR } from 'src/errors/common.errors';
import { STEP_ERR } from 'src/errors/step.errors';
import { Step } from 'src/step/entities/step.entity';
import { Users } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
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
import { Comment } from './entities/comment.entity';

const getManyAndCountSpy = jest.fn();

const mockCommentRespository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getManyAndCount: getManyAndCountSpy,
  }),
});

const mockStepRepository = () => ({
  findOne: jest.fn(),
});

describe('CommentService', () => {
  let service: CommentService;
  let commentRepo: Partial<Record<keyof Repository<Comment>, jest.Mock>>;
  let stepRepo: Partial<Record<keyof Repository<Step>, jest.Mock>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CommentService,
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRespository(),
        },
        {
          provide: getRepositoryToken(Step),
          useValue: mockStepRepository(),
        },
      ],
    }).compile();
    service = module.get<CommentService>(CommentService);
    commentRepo = module.get(getRepositoryToken(Comment));
    stepRepo = module.get(getRepositoryToken(Step));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createComment', () => {
    const mockAuthUser = new Users();
    const mockInput: CreateCommentInput = { stepId: 50, text: 'mockComment' };
    const mockStep = new Step();
    const mockComment = new Comment();
    mockStep.id = mockInput.stepId;

    it('should fail if step does not exist', async () => {
      stepRepo.findOne.mockResolvedValue(undefined);
      const result = await service.createComment(mockAuthUser, mockInput);
      expect(stepRepo.findOne).toHaveBeenCalledTimes(1);
      expect(stepRepo.findOne).toHaveBeenCalledWith({ id: mockInput.stepId });
      expect(result).toEqual<CreateCommentOutput>({
        ok: false,
        error: STEP_ERR.StepNotFound,
      });
    });

    it('should create comment', async () => {
      mockComment.id = 1;
      mockComment.creator = mockAuthUser;
      mockComment.step = mockStep;
      stepRepo.findOne.mockResolvedValue(mockStep);
      commentRepo.create.mockReturnValue(mockComment);
      commentRepo.save.mockResolvedValue(mockComment);
      const result = await service.createComment(mockAuthUser, mockInput);
      expect(commentRepo.create).toHaveBeenCalledTimes(1);
      expect(commentRepo.save).toHaveBeenCalledTimes(1);
      expect(commentRepo.create).toHaveBeenCalledWith(mockInput);
      expect(commentRepo.save).toHaveBeenCalledWith(mockComment);
      expect(result).toEqual<CreateCommentOutput>({
        ok: true,
        commentId: mockComment.id,
      });
    });

    it('should fail on exception', async () => {
      stepRepo.findOne.mockRejectedValue(new Error());
      const result = await service.createComment(mockAuthUser, mockInput);
      expect(result).toEqual<CreateCommentOutput>({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('listComments', async () => {
    const take = 10;
    const count = 10;
    const mockComment = new Comment();
    const mockInput: ListCommentsInput = { stepId: 1, cursorDate: undefined };
    mockComment.createdAt = new Date();

    it('should return comments when cursorDate is undefined', async () => {
      getManyAndCountSpy.mockResolvedValue([[mockComment], count]);
      const result = await service.listComments(mockInput);
      expect(result).toEqual<ListCommentsOutput>({
        ok: true,
        step: { id: mockInput.stepId, comments: [mockComment] },
        endCursorDate: mockComment.createdAt,
        hasNextPage: 0 < count - take,
      });
    });

    it('should return comments when cursorDate is provided', async () => {
      mockInput.cursorDate = new Date();
      getManyAndCountSpy.mockResolvedValue([[mockComment], count]);
      const result = await service.listComments(mockInput);
      expect(result).toEqual<ListCommentsOutput>({
        ok: true,
        step: { id: mockInput.stepId, comments: [mockComment] },
        endCursorDate: mockComment.createdAt,
        hasNextPage: 0 < count - take,
      });
    });

    it('should return empty comments', async () => {
      mockInput.cursorDate = new Date();
      getManyAndCountSpy.mockResolvedValue([[], count]);
      const result = await service.listComments(mockInput);
      expect(result).toEqual<ListCommentsOutput>({
        ok: true,
        step: { id: mockInput.stepId, comments: [] },
        endCursorDate: null,
        hasNextPage: 0 < count - take,
      });
    });

    it('should fail on exception', async () => {
      getManyAndCountSpy.mockRejectedValue(new Error());
      const result = await service.listComments(mockInput);
      expect(result).toEqual<ListCommentsOutput>({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('deleteComment', () => {
    const mockAuthUser = new Users();
    const mockInput: DeleteCommentInput = { id: 1 };
    const mockComment = new Comment();

    it('should fail if comment does not exist', async () => {
      commentRepo.findOne.mockResolvedValue(undefined);
      const result = await service.deleteComment(mockAuthUser, mockInput);
      expect(commentRepo.findOne).toHaveBeenCalledTimes(1);
      expect(commentRepo.findOne).toHaveBeenCalledWith(mockInput.id);
      expect(result).toEqual<DeleteCommentOutput>({
        ok: false,
        error: COMMENT_ERR.CommentNotFound,
      });
    });

    it('should fail if user is not authorized', async () => {
      mockAuthUser.id = 99;
      mockComment.creatorId = 1;
      commentRepo.findOne.mockResolvedValue(mockComment);
      const result = await service.deleteComment(mockAuthUser, mockInput);
      expect(result).toEqual<DeleteCommentOutput>({
        ok: false,
        error: COMMON_ERR.NotAuthorized,
      });
    });

    it('should fail if nothing deleted', async () => {
      mockAuthUser.id = 99;
      mockComment.creatorId = mockAuthUser.id;
      commentRepo.findOne.mockResolvedValue(mockComment);
      commentRepo.delete.mockResolvedValue({ affected: 0 });
      const result = await service.deleteComment(mockAuthUser, mockInput);
      expect(result).toEqual<DeleteCommentOutput>({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });

    it('should delete comment', async () => {
      commentRepo.findOne.mockResolvedValue(mockComment);
      commentRepo.delete.mockResolvedValue({ affected: 1 });
      const result = await service.deleteComment(mockAuthUser, mockInput);
      expect(result).toEqual<DeleteCommentOutput>({ ok: true });
    });

    it('should fail on exception', async () => {
      commentRepo.findOne.mockRejectedValue(new Error());
      const result = await service.deleteComment(mockAuthUser, mockInput);
      expect(result).toEqual<DeleteCommentOutput>({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });
});
