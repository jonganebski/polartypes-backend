import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { COMMON_ERR } from 'src/errors/common.errors';
import { TRIP_ERR } from 'src/errors/trip.errors';
import { USER_ERR } from 'src/errors/user.errors';
import { Step } from 'src/step/entities/step.entity';
import { Users } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/user.service';
import * as typeorm from 'typeorm';
import { ReadTripInput, ReadTripOutput } from './dto/read-trip.dto';
import { ReadTripsInput } from './dto/read-trips.dto';
import { Availability, Trip } from './entities/trip.entity';
import { TripService } from './trip.service';
import { FindOperator } from 'typeorm';

const whereSpy = jest.fn().mockReturnThis();
const leftJoinSpy = jest.fn().mockReturnThis();
const andWhereSpy = jest.fn().mockReturnThis();
const leftJoinAndSelectSpy = jest.fn().mockReturnThis();
const orderBySpy = jest.fn().mockReturnThis();
const getManySpy = jest.fn();
const getOneSpy = jest.fn();

const mockTripRepo = () => {
  return {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    increment: jest.fn(),
    delete: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: whereSpy,
      leftJoin: leftJoinSpy,
      andWhere: andWhereSpy,
      leftJoinAndSelect: leftJoinAndSelectSpy,
      orderBy: orderBySpy,
      getMany: getManySpy,
      getOne: getOneSpy,
    }),
  };
};

const mockUserRepo = () => {
  return {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue({
      where: whereSpy,
      getOne: getOneSpy,
    }),
  };
};

const mockAwsS3Service = () => {
  return {
    deleteImage: jest.fn(() => Promise.resolve(true)),
  };
};

const isFollowingSpy = jest.fn();
const mockUserService = () => {
  return { isFollowing: isFollowingSpy };
};

describe('tripService', () => {
  let service: TripService;
  let tripRepo: Partial<Record<keyof typeorm.Repository<Trip>, jest.Mock>>;
  let userRepo: Partial<Record<keyof typeorm.Repository<Users>, jest.Mock>>;
  let awsS3Service: AwsS3Service;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TripService,
        { provide: getRepositoryToken(Trip), useValue: mockTripRepo() },
        { provide: getRepositoryToken(Users), useValue: mockUserRepo() },
        { provide: AwsS3Service, useValue: mockAwsS3Service() },
        { provide: UserService, useValue: mockUserService() },
      ],
    }).compile();
    service = module.get<TripService>(TripService);
    tripRepo = module.get(getRepositoryToken(Trip));
    userRepo = module.get(getRepositoryToken(Users));
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
  });

  it.todo('should be defined');

  describe('getPermissions', () => {
    const mockAuthUser = new Users();
    const mockTargetUserSlug = 'mockingSlug';

    it('should return PUBLIC, FOLLOWERS, PRIVATE permissions', async () => {
      mockAuthUser.slug = mockTargetUserSlug;
      isFollowingSpy.mockResolvedValue(true);
      const result = await service.getPermissions(
        mockAuthUser,
        mockTargetUserSlug,
      );
      expect(result).toEqual([
        Availability.Private,
        Availability.Followers,
        Availability.Public,
      ]);
    });

    it('should return PUBLIC permission', async () => {
      isFollowingSpy.mockResolvedValue(false);
      const result = await service.getPermissions(
        undefined,
        mockTargetUserSlug,
      );
      expect(result).toEqual([Availability.Public]);
    });

    it('should return PUBLIC, FOLLOWERS permissions', async () => {
      mockAuthUser.slug = 'different';
      isFollowingSpy.mockResolvedValue(true);
      const result = await service.getPermissions(
        mockAuthUser,
        mockTargetUserSlug,
      );
      expect(result).toEqual([Availability.Public, Availability.Followers]);
    });
  });

  describe('createTrip', () => {
    const mockUser = new Users();
    const createTripInput = {
      startDate: '',
      name: '',
      availability: Availability.Public,
    };
    it('should create trip', async () => {
      tripRepo.create.mockReturnValue({ id: 1, ...createTripInput });
      tripRepo.save.mockResolvedValue({ id: 1 });
      const result = await service.createTrip(mockUser, createTripInput);
      expect(tripRepo.create).toHaveBeenCalledTimes(1);
      expect(tripRepo.create).toHaveBeenCalledWith(createTripInput);
      expect(tripRepo.save).toHaveBeenCalledTimes(1);
      expect(tripRepo.save).toHaveBeenCalledWith({
        id: 1,
        ...createTripInput,
        traveler: mockUser,
      });
      expect(result).toEqual({ ok: true, tripId: 1 });
    });

    it('should fail on exception', async () => {
      tripRepo.create.mockRejectedValue(new Error());
      const result = await service.createTrip(mockUser, createTripInput);
      expect(result).toEqual({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('readTrips', () => {
    const mockAuthUser = new Users();
    const mockTrip = new Trip();
    const mockInput = new ReadTripsInput();

    it('should fail if targetUser is not found', async () => {
      getOneSpy.mockResolvedValue(undefined);
      const result = await service.readTrips(mockAuthUser, mockInput);
      expect(result).toEqual({ ok: false, error: USER_ERR.UserNotFound });
    });

    it('should return targetUser', async () => {
      getOneSpy.mockResolvedValue(mockAuthUser);
      isFollowingSpy.mockResolvedValue([Availability.Private]);
      getManySpy.mockResolvedValue([mockTrip]);
      const result = await service.readTrips(mockAuthUser, mockInput);
      expect(result).toEqual({
        ok: true,
        targetUser: { ...mockAuthUser, trips: [mockTrip] },
      });
    });

    it('should fail on exception', async () => {
      getOneSpy.mockRejectedValue(new Error());
      const result = await service.readTrips(mockAuthUser, mockInput);
      expect(result).toEqual({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('readTrip', () => {
    const mockAuthUser = new Users();
    const mockTargetUser = new Users();
    const mockTrip = new Trip();
    const mockInput = new ReadTripInput();

    it('should fail if trip not found', async () => {
      getOneSpy.mockResolvedValue(undefined);
      const result = await service.readTrip(mockAuthUser, mockInput);
      expect(result).toEqual<ReadTripOutput>({
        ok: false,
        error: TRIP_ERR.TripNotFound,
      });
    });

    it('should fail if targetUser is not found', async () => {
      getOneSpy.mockResolvedValue(mockTrip);
      userRepo.findOne.mockResolvedValue(undefined);
      const result = await service.readTrip(mockAuthUser, mockInput);
      expect(userRepo.findOne).toHaveBeenCalledTimes(1);
      expect(userRepo.findOne).toHaveBeenCalledWith(
        { id: mockTrip.travelerId },
        { relations: ['followers'] },
      );
      expect(result).toEqual<ReadTripOutput>({
        ok: false,
        error: USER_ERR.UserNotFound,
      });
    });

    it('should fail when user is not authorized', async () => {
      mockAuthUser.slug = 'authUser';
      mockTargetUser.slug = 'notAuthorized';
      mockTrip.availability = Availability.Private;
      getOneSpy.mockResolvedValue(mockTrip);
      userRepo.findOne.mockResolvedValue(mockTargetUser);
      const result = await service.readTrip(mockAuthUser, mockInput);
      expect(result).toEqual<ReadTripOutput>({
        ok: false,
        error: COMMON_ERR.NotAuthorized,
      });
    });

    it('should increase view count and return', async () => {
      mockTrip.travelerId = 999;
      getOneSpy.mockResolvedValue(mockTrip);
      userRepo.findOne.mockResolvedValue(mockTargetUser);
      mockTrip.availability = Availability.Public;
      const result = await service.readTrip(undefined, mockInput);
      expect(tripRepo.increment).toHaveBeenCalledTimes(1);
      expect(result).toEqual<ReadTripOutput>({ ok: true, trip: mockTrip });
    });

    it('should not increase view count and return', async () => {
      mockAuthUser.id = 1;
      mockTrip.travelerId = 1;
      getOneSpy.mockResolvedValue(mockTrip);
      userRepo.findOne.mockResolvedValue(mockTargetUser);
      mockTrip.availability = Availability.Public;
      const result = await service.readTrip(mockAuthUser, mockInput);
      expect(tripRepo.increment).toHaveBeenCalledTimes(0);
      expect(result).toEqual<ReadTripOutput>({ ok: true, trip: mockTrip });
    });

    it('should fail on exception', async () => {
      getOneSpy.mockRejectedValue(new Error());
      const result = await service.readTrip(mockAuthUser, mockInput);
      expect(result).toEqual<ReadTripOutput>({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('updateTrip', () => {
    const mockUser = new Users();
    const mockTrip = new Trip();
    const mockInput = { tripId: 1 };
    it('should fail when trip not found', async () => {
      tripRepo.findOne.mockResolvedValue(undefined);
      const result = await service.updateTrip(mockUser, mockInput);
      expect(tripRepo.findOne).toHaveBeenCalledTimes(1);
      expect(tripRepo.findOne).toHaveBeenCalledWith({ id: mockInput.tripId });
      expect(result).toEqual({ ok: false, error: TRIP_ERR.TripNotFound });
    });

    it('should fail when user is not authorized', async () => {
      mockUser.id = 1;
      mockTrip.travelerId = 999;
      tripRepo.findOne.mockResolvedValue(mockTrip);
      const result = await service.updateTrip(mockUser, mockInput);
      expect(result).toEqual({ ok: false, error: COMMON_ERR.NotAuthorized });
    });

    it('should update trip', async () => {
      mockUser.id = 1;
      mockTrip.travelerId = 1;
      tripRepo.findOne.mockResolvedValue(mockTrip);
      const result = await service.updateTrip(mockUser, mockInput);
      expect(tripRepo.save).toHaveBeenCalledTimes(1);
      expect(tripRepo.save).toHaveBeenCalledWith([{ id: mockInput.tripId }]);
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      tripRepo.findOne.mockRejectedValue(new Error());
      const result = await service.updateTrip(mockUser, mockInput);
      expect(result).toEqual({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('deleteTrip', () => {
    const mockUser = new Users();
    const mockTrip = new Trip();
    const mockInput = { tripId: 1, name: 'mockingtrip' };
    it('should fail if trip is not found', async () => {
      tripRepo.findOne.mockResolvedValue(undefined);
      const result = await service.deleteTrip(mockUser, mockInput);
      expect(tripRepo.findOne).toHaveBeenCalledTimes(1);
      expect(tripRepo.findOne).toHaveBeenCalledWith(
        { id: mockInput.tripId },
        { relations: ['steps'] },
      );
      expect(result).toEqual({ ok: false, error: TRIP_ERR.TripNotFound });
    });

    it('should fail when user is not authorized', async () => {
      mockUser.id = 1;
      mockTrip.travelerId = 999;
      tripRepo.findOne.mockResolvedValue(mockTrip);
      const result = await service.deleteTrip(mockUser, mockInput);
      expect(result).toEqual({ ok: false, error: COMMON_ERR.NotAuthorized });
    });

    it('should delete trip', async () => {
      const mockStep = new Step();
      const mockImgUrls = ['a', 'b', 'c'];
      mockStep.imgUrls = mockImgUrls;
      mockTrip.steps = [mockStep];
      mockTrip.travelerId = 1;
      mockUser.id = 1;
      tripRepo.findOne.mockResolvedValue(mockTrip);
      tripRepo.delete.mockResolvedValue({ affected: 1 });
      const result = await service.deleteTrip(mockUser, mockInput);
      expect(awsS3Service.deleteImage).toHaveBeenCalledTimes(1);
      expect(awsS3Service.deleteImage).toHaveBeenCalledWith({
        urls: mockImgUrls,
      });
      expect(tripRepo.delete).toHaveBeenCalledTimes(1);
      expect(tripRepo.delete).toHaveBeenCalledWith({ id: mockInput.tripId });
      expect(result).toEqual({ ok: true });
    });

    it('should fail on affected !== 1', async () => {
      tripRepo.findOne.mockResolvedValue(mockTrip);
      tripRepo.delete.mockResolvedValue({ affected: 999 });
      const result = await service.deleteTrip(mockUser, mockInput);
      expect(result).toEqual({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });

    it('should fail on exception', async () => {
      tripRepo.findOne.mockRejectedValue(new Error());
      const result = await service.deleteTrip(mockUser, mockInput);
      expect(result).toEqual({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });

  describe('search', () => {
    const mockSearchTerm = 'mockingcow';
    const mockUsers = [new Users()];
    const mockUsersCount = 1;
    const mockTrips = [new Trip()];
    const mockTripsCount = 1;
    it('should return search result', async () => {
      const rawSpy = jest.spyOn(typeorm, 'Raw');
      rawSpy.mockImplementation((x) => {
        x('columnAlias');
        return new FindOperator<any>('any', '');
      });
      userRepo.findAndCount.mockResolvedValue([mockUsers, mockUsersCount]);
      tripRepo.findAndCount.mockResolvedValue([mockTrips, mockTripsCount]);
      const result = await service.search({ searchTerm: mockSearchTerm });
      expect(userRepo.findAndCount).toHaveBeenCalledTimes(1);
      expect(userRepo.findAndCount).toHaveBeenCalledWith(expect.any(Object));
      expect(tripRepo.findAndCount).toHaveBeenCalledTimes(1);
      expect(tripRepo.findAndCount).toHaveBeenCalledWith(expect.any(Object));
      expect(rawSpy).toHaveBeenCalledTimes(3);
      expect(result).toEqual({
        ok: true,
        users: mockUsers,
        usersCount: mockUsersCount,
        trips: mockTrips,
        tripsCount: mockTripsCount,
      });
    });

    it('should fail on exception', async () => {
      userRepo.findAndCount.mockRejectedValue(new Error());
      const result = await service.search({ searchTerm: mockSearchTerm });
      expect(result).toEqual({
        ok: false,
        error: COMMON_ERR.InternalServerErr,
      });
    });
  });
});
