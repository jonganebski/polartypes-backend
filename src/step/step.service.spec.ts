import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from 'src/comment/entities/comment.entity';
import { COMMON_ERR } from 'src/errors/common.errors';
import { STEP_ERR } from 'src/errors/step.errors';
import { Trip } from 'src/trip/entities/trip.entity';
import { Users } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateStepInput } from './dto/create-step.dto';
import { DeleteStepInput, DeleteStepOutput } from './dto/delete-step.dto';
import { LikesInfoOutput } from './dto/likes-info.dto';
import { ToggleLikeInput, ToggleLikeOutput } from './dto/toggle-like.dto';
import { UpdateStepInput, UpdateStepOutput } from './dto/update-step.dto';
import { Like } from './entities/like.entity';
import { Step } from './entities/step.entity';
import { LikeService, StepService } from './step.service';

const getCountSpy = jest.fn();

const mockStepRepository = () => {
  return {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: getCountSpy,
    }),
  };
};

const mockTripRepository = () => {
  return { findOne: jest.fn() };
};

const mockCommentRespository = () => {
  return {
    createQueryBuilder: jest.fn().mockReturnValue({
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: getCountSpy,
    }),
  };
};

const mockLikeRepository = () => {
  return {
    findOne: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    count: jest.fn(),
  };
};

describe('stepService', () => {
  let service: StepService;
  let stepRepo: Partial<Record<keyof Repository<Step>, jest.Mock>>;
  let tripRepo: Partial<Record<keyof Repository<Trip>, jest.Mock>>;
  let likeRepo: Partial<Record<keyof Repository<Like>, jest.Mock>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StepService,
        { provide: getRepositoryToken(Step), useValue: mockStepRepository() },
        { provide: getRepositoryToken(Trip), useValue: mockTripRepository() },
        { provide: getRepositoryToken(Like), useValue: mockLikeRepository() },
        {
          provide: getRepositoryToken(Comment),
          useValue: mockCommentRespository(),
        },
      ],
    }).compile();
    service = module.get<StepService>(StepService);
    stepRepo = module.get(getRepositoryToken(Step));
    tripRepo = module.get(getRepositoryToken(Trip));
    likeRepo = module.get(getRepositoryToken(Like));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createStep', () => {
    const mockUser = new Users();
    const mockInput = new CreateStepInput();
    const mockTrip = { id: 1 };
    const mockCreatedStep = { id: 999 };

    it('should create step', async () => {
      tripRepo.findOne.mockResolvedValue(mockTrip);
      stepRepo.create.mockResolvedValue(mockCreatedStep);
      stepRepo.save.mockResolvedValue(mockCreatedStep);
      const result = await service.createStep(mockUser, mockInput);
      expect(tripRepo.findOne).toHaveBeenCalledTimes(1);
      expect(tripRepo.findOne).toHaveBeenCalledWith({ id: mockInput.tripId });
      expect(stepRepo.create).toHaveBeenCalledTimes(1);
      expect(stepRepo.create).toHaveBeenCalledWith(mockInput);
      expect(stepRepo.save).toHaveBeenCalledTimes(1);
      expect(stepRepo.save).toHaveBeenCalledWith(mockCreatedStep);
      expect(result).toEqual({ ok: true, createdStepId: mockCreatedStep.id });
    });

    it('should fail on exception', async () => {
      tripRepo.findOne.mockRejectedValue(mockTrip);
      const result = await service.createStep(mockUser, mockInput);
      expect(result).toEqual({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('updateStep', () => {
    const mockAuthUser = new Users();
    const mockInput = new UpdateStepInput();
    const mockStep = new Step();
    mockInput.stepId = 1;

    it('should fail if step does not exist', async () => {
      stepRepo.findOne.mockResolvedValue(undefined);
      const result = await service.updateStep(mockAuthUser, mockInput);
      expect(stepRepo.findOne).toHaveBeenCalledTimes(1);
      expect(stepRepo.findOne).toHaveBeenCalledWith({ id: mockInput.stepId });
      expect(result).toEqual<UpdateStepOutput>({
        ok: false,
        error: STEP_ERR.StepNotFound,
      });
    });

    it('should fail if user is not authorized', async () => {
      mockAuthUser.id = 1;
      mockStep.travelerId = 999;
      stepRepo.findOne.mockResolvedValue(mockStep);
      const result = await service.updateStep(mockAuthUser, mockInput);
      expect(result).toEqual<UpdateStepOutput>({
        ok: false,
        error: COMMON_ERR.NotAuthorized,
      });
    });

    it('should update step', async () => {
      const sameId = 10;
      const mockOldStep = new Step();
      mockAuthUser.id = sameId;
      mockOldStep.travelerId = sameId;
      mockInput.imgUrls = ['m', 'o', 'c', 'k'];
      const mockNewStep = { ...mockOldStep, ...mockInput };

      stepRepo.findOne.mockResolvedValue(mockOldStep);
      stepRepo.save.mockResolvedValue(mockNewStep);
      const result = await service.updateStep(mockAuthUser, mockInput);
      expect(stepRepo.save).toHaveBeenCalledTimes(1);
      expect(stepRepo.save).toHaveBeenCalledWith({
        id: mockInput.stepId,
        ...mockInput,
      });
      expect(result).toEqual<UpdateStepOutput>({
        ok: true,
        imgUrls: mockInput.imgUrls,
      });
    });

    it('should fail on exception', async () => {
      stepRepo.findOne.mockRejectedValue(new Error());
      const result = await service.updateStep(mockAuthUser, mockInput);
      expect(result).toEqual<UpdateStepOutput>({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('deleteStep', () => {
    const mockAuthUser = new Users();
    const mockInput = new DeleteStepInput();
    const mockStep = new Step();
    mockInput.stepId = 1;

    it('should fail if step does not exist', async () => {
      stepRepo.findOne.mockResolvedValue(undefined);
      const result = await service.deleteStep(mockAuthUser, mockInput);
      expect(stepRepo.findOne).toHaveBeenCalledTimes(1);
      expect(stepRepo.findOne).toHaveBeenCalledWith({ id: mockInput.stepId });
      expect(result).toEqual<DeleteStepOutput>({
        ok: false,
        error: STEP_ERR.StepNotFound,
      });
    });

    it('should fail if user is not authorized', async () => {
      mockAuthUser.id = 1;
      mockStep.travelerId = 999;
      stepRepo.findOne.mockResolvedValue(mockStep);
      const result = await service.deleteStep(mockAuthUser, mockInput);
      expect(result).toEqual<DeleteStepOutput>({
        ok: false,
        error: COMMON_ERR.NotAuthorized,
      });
    });

    it('should remove step', async () => {
      const sameId = 10;
      mockAuthUser.id = sameId;
      mockStep.travelerId = sameId;
      stepRepo.findOne.mockResolvedValue(mockStep);
      const result = await service.deleteStep(mockAuthUser, mockInput);
      expect(stepRepo.remove).toHaveBeenCalledTimes(1);
      expect(stepRepo.remove).toHaveBeenCalledWith([mockStep]);
      expect(result).toEqual<DeleteStepOutput>({
        ok: true,
        stepId: mockInput.stepId,
      });
    });

    it('should fail on exception', async () => {
      stepRepo.findOne.mockRejectedValue(new Error());
      const result = await service.deleteStep(mockAuthUser, mockInput);
      expect(result).toEqual<DeleteStepOutput>({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('countComments', () => {
    const mockStep = new Step();
    const commentsCount = 10;

    it('should return count of comments', async () => {
      getCountSpy.mockResolvedValue(commentsCount);
      const result = await service.countComments(mockStep);
      expect(result).toEqual(commentsCount);
    });
  });

  describe('likesInfo', () => {
    const mockStep = new Step();
    const mockLikes = new Array(3).fill(new Like());
    const mockLikesCount = 10;
    mockStep.id = 1;
    it('should return like info', async () => {
      likeRepo.findAndCount.mockResolvedValue([mockLikes, mockLikesCount]);
      const result = await service.likesInfo(mockStep);
      expect(likeRepo.findAndCount).toHaveBeenCalledTimes(1);
      expect(likeRepo.findAndCount).toHaveBeenCalledWith({
        where: { stepId: mockStep.id },
        relations: ['user'],
        take: 3,
      });
      expect(result).toEqual<LikesInfoOutput>({
        samples: mockLikes,
        totalCount: mockLikesCount,
      });
    });
  });

  describe('didLiked', () => {
    const mockStep = new Step();
    const mockAuthUser = new Users();
    mockStep.id = 50;
    mockAuthUser.id = 60;

    it('should fail if user is logged out', async () => {
      const result = await service.didILiked(mockStep, undefined);
      expect(result).toEqual(false);
    });

    it('should return did I liked or not', async () => {
      const likeCount = 1;
      likeRepo.count.mockResolvedValue(likeCount);
      const result = await service.didILiked(mockStep, mockAuthUser);
      expect(likeRepo.count).toHaveBeenCalledTimes(1);
      expect(likeRepo.count).toHaveBeenCalledWith({
        where: { userId: mockAuthUser.id, stepId: mockStep.id },
      });
      expect(result).toEqual(Boolean(likeCount));
    });
  });
});

describe('likeService', () => {
  let service: LikeService;
  let likeRepo: Partial<Record<keyof Repository<Like>, jest.Mock>>;
  let stepRepo: Partial<Record<keyof Repository<Step>, jest.Mock>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LikeService,
        { provide: getRepositoryToken(Like), useValue: mockLikeRepository() },
        { provide: getRepositoryToken(Step), useValue: mockStepRepository() },
      ],
    }).compile();
    service = module.get<LikeService>(LikeService);
    likeRepo = module.get(getRepositoryToken(Like));
    stepRepo = module.get(getRepositoryToken(Step));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('toggleLike', () => {
    const mockAuthUser = new Users();
    const mockLike = new Like();
    const mockStep = new Step();
    const mockInput: ToggleLikeInput = { id: 50 };
    mockAuthUser.id = 1;
    mockLike.userId = mockAuthUser.id;

    it('should delete like if it exists', async () => {
      mockLike.stepId = mockInput.id;
      likeRepo.findOne.mockResolvedValue(mockLike);
      const result = await service.toggleLike(mockAuthUser, mockInput);
      expect(likeRepo.findOne).toHaveBeenCalledTimes(1);
      expect(likeRepo.delete).toHaveBeenCalledTimes(1);
      expect(likeRepo.findOne).toHaveBeenCalledWith({
        userId: mockAuthUser.id,
        stepId: mockLike.stepId,
      });
      expect(likeRepo.delete).toHaveBeenCalledWith({
        userId: mockAuthUser.id,
        stepId: mockLike.stepId,
      });
      expect(result).toEqual<ToggleLikeOutput>({ ok: true, toggle: -999 });
    });

    it('should create like if it does not exist', async () => {
      mockStep.id = mockInput.id;
      likeRepo.findOne.mockResolvedValue(undefined);
      stepRepo.findOne.mockResolvedValue(mockStep);
      likeRepo.create.mockReturnValue(mockLike);
      const result = await service.toggleLike(mockAuthUser, mockInput);
      expect(likeRepo.findOne).toHaveBeenCalledTimes(1);
      expect(stepRepo.findOne).toHaveBeenCalledTimes(1);
      expect(likeRepo.create).toHaveBeenCalledTimes(1);
      expect(likeRepo.save).toHaveBeenCalledTimes(1);
      expect(stepRepo.findOne).toHaveBeenCalledWith({ id: mockInput.id });
      expect(likeRepo.create).toHaveBeenCalledWith({
        user: mockAuthUser,
        step: mockStep,
      });
      expect(likeRepo.save).toHaveBeenCalledWith(mockLike);
      expect(result).toEqual<ToggleLikeOutput>({ ok: true, toggle: 999 });
    });

    it('should fail on exception', async () => {
      likeRepo.findOne.mockRejectedValue(new Error());
      const result = await service.toggleLike(mockAuthUser, mockInput);
      expect(result).toEqual<ToggleLikeOutput>({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });
});
