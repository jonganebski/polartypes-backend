import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { STEP_ERR } from 'src/common/common.constants';
import { Trip } from 'src/trip/entities/trip.entity';
import { Users } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateStepInput } from './dto/create-step.dto';
import { Like } from './entities/like.entity';
import { Step } from './entities/step.entity';
import { LikeService, StepService } from './step.service';

const mockStepRepository = () => {
  return {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };
};

const mockTripRepository = () => {
  return { findOne: jest.fn() };
};

const mockLikeRepository = () => {
  return {
    findOne: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
};

describe('stepService', () => {
  let service: StepService;
  let stepRepo: Partial<Record<keyof Repository<Step>, jest.Mock>>;
  let tripRepo: Partial<Record<keyof Repository<Trip>, jest.Mock>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        StepService,
        { provide: getRepositoryToken(Step), useValue: mockStepRepository() },
        { provide: getRepositoryToken(Trip), useValue: mockTripRepository() },
      ],
    }).compile();
    service = module.get<StepService>(StepService);
    stepRepo = module.get(getRepositoryToken(Step));
    tripRepo = module.get(getRepositoryToken(Trip));
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
      expect(result).toEqual({ ok: false, error: STEP_ERR.createStepfailed });
    });
  });

  it.todo('updateStep');

  it.todo('deleteStep');
});

describe('likeService', () => {
  let service: LikeService;
  let likeRepo: Partial<Record<keyof Repository<Like>, jest.Mock>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LikeService,
        { provide: getRepositoryToken(Like), useValue: mockLikeRepository },
      ],
    }).compile();
    service = module.get<LikeService>(LikeService);
    likeRepo = module.get(getRepositoryToken(Like));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it.todo('toggleLike');
});
