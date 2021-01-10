import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { TRIP_ERR, USER_ERR } from 'src/common/common.constants';
import { Step } from 'src/step/entities/step.entity';
import { Users } from 'src/users/entities/user.entity';
import * as typeorm from 'typeorm';
import { Availability, Trip } from './entities/trip.entity';
import { TripService } from './trip.service';

const mockTripRepo = () => {
  return {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    increment: jest.fn(),
    delete: jest.fn(),
    findAndCount: jest.fn(),
  };
};

const mockUserRepo = () => {
  return { findOne: jest.fn(), findAndCount: jest.fn() };
};

const mockAwsS3Service = () => {
  return {
    deleteImage: jest.fn(() => Promise.resolve(true)),
  };
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
      ],
    }).compile();
    service = module.get<TripService>(TripService);
    tripRepo = module.get(getRepositoryToken(Trip));
    userRepo = module.get(getRepositoryToken(Users));
    awsS3Service = module.get<AwsS3Service>(AwsS3Service);
  });

  it.todo('should be defined');

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
      expect(result).toEqual({ ok: false, error: TRIP_ERR.failed });
    });
  });

  describe('readTrips', () => {
    const mockUser = new Users();
    const mockTargetUser = new Users();
    const mockTrip = new Trip();
    const mockInput = { targetUsername: 'mockingbird' };
    it('should fail if targetUser is not found', async () => {
      userRepo.findOne.mockResolvedValue(undefined);
      const result = await service.readTrips(mockUser, mockInput);
      expect(userRepo.findOne).toHaveBeenCalledTimes(1);
      expect(userRepo.findOne).toHaveBeenCalledWith(
        {
          slug: mockInput.targetUsername.toLocaleLowerCase(),
        },
        {
          relations: [
            'trips',
            'trips.steps',
            'trips.steps.likes',
            'trips.steps.likes.user',
            'followers',
            'followings',
          ],
        },
      );
      expect(result).toEqual({ ok: false, error: USER_ERR.userNotFound });
    });

    it('should return targetUser with all trips if user is targetUser', async () => {
      mockUser.id = 1;
      mockTargetUser.id = 1;
      userRepo.findOne.mockResolvedValue(mockTargetUser);
      const result = await service.readTrips(mockUser, mockInput);
      expect(result).toEqual({ ok: true, targetUser: mockTargetUser });
    });

    it("should return targetUser with followers allowed trips if user is targetUser's follower", async () => {
      mockUser.id = 1;
      mockTargetUser.id = 999;
      mockTrip.availability = Availability.Followers;
      mockTargetUser.followers = [mockUser];
      mockTargetUser.trips = [mockTrip];
      userRepo.findOne.mockResolvedValue(mockTargetUser);
      const result = await service.readTrips(mockUser, mockInput);
      expect(result).toEqual({ ok: true, targetUser: mockTargetUser });
    });

    it('should return targetUser with public trips', async () => {
      mockUser.id = 1;
      mockTargetUser.id = 999;
      mockTrip.availability = Availability.Public;
      mockTargetUser.followers = [];
      mockTargetUser.trips = [mockTrip];
      userRepo.findOne.mockResolvedValue(mockTargetUser);
      const result = await service.readTrips(mockUser, mockInput);
      expect(result).toEqual({ ok: true, targetUser: mockTargetUser });
    });

    it('should fail on exception', async () => {
      userRepo.findOne.mockRejectedValue(new Error());
      const result = await service.readTrips(mockUser, mockInput);
      expect(result).toEqual({ ok: false, error: TRIP_ERR.failed });
    });
  });

  describe('readTrip', () => {
    const mockUser = new Users();
    const mockTargetUser = new Users();
    const mockTrip = new Trip();
    const mockInput = { tripId: 1 };

    it('should fail if trip not found', async () => {
      tripRepo.findOne.mockResolvedValue(undefined);
      const result = await service.readTrip(mockUser, mockInput);
      expect(tripRepo.findOne).toHaveBeenCalledTimes(1);
      expect(tripRepo.findOne).toHaveBeenCalledWith(
        {
          id: mockInput.tripId,
        },
        {
          relations: [
            'steps',
            'steps.traveler',
            'steps.likes',
            'steps.likes.user',
            'steps.comments',
            'steps.comments.creator',
            'traveler',
            'traveler.followers',
            'traveler.followings',
          ],
        },
      );
      expect(result).toEqual({ ok: false, error: TRIP_ERR.tripNotFound });
    });

    it('should fail if targetUser is not found', async () => {
      tripRepo.findOne.mockResolvedValue(mockTrip);
      userRepo.findOne.mockResolvedValue(undefined);
      const result = await service.readTrip(mockUser, mockInput);
      expect(userRepo.findOne).toHaveBeenCalledTimes(1);
      expect(userRepo.findOne).toHaveBeenCalledWith(
        { id: mockTrip.travelerId },
        { relations: ['followers'] },
      );
      expect(result).toEqual({ ok: false, error: USER_ERR.userNotFound });
    });

    it('should fail when user is not authorized', async () => {
      mockUser.id = 1;
      mockTrip.travelerId = 999;
      mockTrip.availability = Availability.Private;
      tripRepo.findOne.mockResolvedValue(mockTrip);
      userRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.readTrip(mockUser, mockInput);
      expect(result).toEqual({ ok: false, error: TRIP_ERR.notAuthorized });
    });

    it('should return trip when targetUser is user', async () => {
      mockUser.id = 1;
      mockTrip.travelerId = 1;
      tripRepo.findOne.mockResolvedValue(mockTrip);
      userRepo.findOne.mockResolvedValue(mockTargetUser);
      const result = await service.readTrip(mockUser, mockInput);
      expect(result).toEqual({ ok: true, trip: mockTrip });
    });

    it('should return trip when availability is follower and user is follower', async () => {
      mockUser.id = 1;
      mockTargetUser.followers = [mockUser];
      mockTrip.id = 1;
      mockTrip.travelerId = 999;
      mockTrip.availability = Availability.Followers;
      tripRepo.findOne.mockResolvedValue(mockTrip);
      userRepo.findOne.mockResolvedValue(mockTargetUser);
      const result = await service.readTrip(mockUser, mockInput);
      expect(tripRepo.increment).toHaveBeenCalledTimes(1);
      expect(tripRepo.increment).toHaveBeenCalledWith(
        { id: mockTrip.id },
        'viewCount',
        1,
      );
      expect(result).toEqual({ ok: true, trip: mockTrip });
    });

    it('should return trip if availability is public', async () => {
      mockTrip.availability = Availability.Public;
      tripRepo.findOne.mockResolvedValue(mockTrip);
      userRepo.findOne.mockResolvedValue(mockTargetUser);
      const result = await service.readTrip(mockUser, mockInput);
      expect(tripRepo.increment).toHaveBeenCalledTimes(1);
      expect(tripRepo.increment).toHaveBeenCalledWith(
        { id: mockTrip.id },
        'viewCount',
        1,
      );
      expect(result).toEqual({ ok: true, trip: mockTrip });
    });

    it('should fail on exception', async () => {
      tripRepo.findOne.mockRejectedValue(new Error());
      const result = await service.readTrip(mockUser, mockInput);
      expect(result).toEqual({ ok: false, error: TRIP_ERR.failed });
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
      expect(result).toEqual({ ok: false, error: TRIP_ERR.tripNotFound });
    });

    it('should fail when user is not authorized', async () => {
      mockUser.id = 1;
      mockTrip.travelerId = 999;
      tripRepo.findOne.mockResolvedValue(mockTrip);
      const result = await service.updateTrip(mockUser, mockInput);
      expect(result).toEqual({ ok: false, error: TRIP_ERR.notAuthorized });
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
      expect(result).toEqual({ ok: false, error: TRIP_ERR.failed });
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
      expect(result).toEqual({ ok: false, error: TRIP_ERR.tripNotFound });
    });

    it('should fail when user is not authorized', async () => {
      mockUser.id = 1;
      mockTrip.travelerId = 999;
      tripRepo.findOne.mockResolvedValue(mockTrip);
      const result = await service.deleteTrip(mockUser, mockInput);
      expect(result).toEqual({ ok: false, error: TRIP_ERR.notAuthorized });
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

    it('should fail on exception', async () => {
      tripRepo.findOne.mockRejectedValue(new Error());
      const result = await service.deleteTrip(mockUser, mockInput);
      expect(result).toEqual({ ok: false, error: TRIP_ERR.failed });
    });
  });

  describe('search', () => {
    const mockSearchTerm = 'mockingcow';
    const mockUsers = [{ id: 1 }];
    const mockUsersCount = 1;
    const mockTrips = [{ id: 1 }];
    const mockTripsCount = 1;
    it('should return search result', async () => {
      const rawSpy = jest.spyOn(typeorm, 'Raw');
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
      expect(result).toEqual({ ok: false, error: TRIP_ERR.failed });
    });
  });
});
