import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { TRIP_ERR } from 'src/errors/trip.errors';
import { COMMON_ERR } from 'src/errors/common.errors';
import { USER_ERR } from 'src/errors/user.errors';
import { Users } from 'src/users/entities/user.entity';
import { Raw, Repository } from 'typeorm';
import { CreateTripInput, CreateTripOutput } from './dto/create-trip.dto';
import { DeleteTripInput, DeleteTripOutput } from './dto/delete-trip.dto';
import { ReadTripInput, ReadTripOutput } from './dto/read-trip.dto';
import { ReadTripsInput, ReadTripsOutput } from './dto/read-trips.dto';
import { SearchInput, SearchOutput } from './dto/search.dto';
import { UpdateTripInput, UpdateTripOutput } from './dto/update-trip.dto';
import { Availability, Trip } from './entities/trip.entity';
import { UserService } from 'src/users/user.service';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip) private readonly tripRepo: Repository<Trip>,
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
    private readonly awsS3Service: AwsS3Service,
    private readonly userService: UserService,
  ) {}

  private getPermissions = async (authUser: Users, targetUserSlug: string) => {
    const permissions = [Availability.Public];
    if (authUser?.slug === targetUserSlug) {
      permissions.push(Availability.Followers, Availability.Private);
    }
    if (await this.userService.isFollowing(targetUserSlug, authUser)) {
      permissions.push(Availability.Followers);
    }
    return permissions;
  };

  async createTrip(
    user: Users,
    createTripInput: CreateTripInput,
  ): Promise<CreateTripOutput> {
    try {
      const newTrip = this.tripRepo.create(createTripInput);
      newTrip.traveler = user;
      const savedTrip = await this.tripRepo.save(newTrip);
      return { ok: true, tripId: savedTrip.id };
    } catch (err) {
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async readTrips(
    authUser: Users,
    { slug }: ReadTripsInput,
  ): Promise<ReadTripsOutput> {
    try {
      const targetUser = await this.userRepo
        .createQueryBuilder('user')
        .where('user.slug = :slug', { slug })
        .getOne();

      if (!targetUser) {
        return { ok: false, error: USER_ERR.UserNotFound };
      }

      const permissions = await this.getPermissions(authUser, slug);

      const trips = await this.tripRepo
        .createQueryBuilder('trip')
        .leftJoin('trip.traveler', 'traveler')
        .where('traveler.id = :id', { id: targetUser.id })
        .andWhere('trip.availability IN (:...permissions)', {
          permissions,
        })
        .leftJoinAndSelect('trip.steps', 'steps')
        .getMany();

      targetUser.trips = trips;

      return { ok: true, targetUser };
    } catch (err) {
      console.error(err);
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async readTrip(
    authUser: Users,
    { tripId }: ReadTripInput,
  ): Promise<ReadTripOutput> {
    try {
      const trip = await this.tripRepo
        .createQueryBuilder('trip')
        .where('trip.id = :tripId', { tripId })
        .leftJoinAndSelect('trip.traveler', 'traveler')
        .leftJoinAndSelect('trip.steps', 'step')
        .orderBy('step.arrivedAt')
        .getOne();

      if (!trip) return { ok: false, error: TRIP_ERR.TripNotFound };

      const targetUser = await this.userRepo.findOne(
        { id: trip.travelerId },
        { relations: ['followers'] },
      );
      if (!targetUser) return { ok: false, error: USER_ERR.UserNotFound };

      const permissions = await this.getPermissions(authUser, targetUser.slug);

      if (!permissions.includes(trip.availability)) {
        return { ok: false, error: COMMON_ERR.NotAuthorized };
      }

      const isSelf = Boolean(authUser?.id === trip.travelerId);

      if (!isSelf) {
        await this.tripRepo.increment({ id: tripId }, 'viewCount', 1);
      }

      return { ok: true, trip };
    } catch (err) {
      console.error(err);
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async updateTrip(
    user: Users,
    { tripId, ...values }: UpdateTripInput,
  ): Promise<UpdateTripOutput> {
    try {
      const trip = await this.tripRepo.findOne({ id: tripId });
      if (!trip) {
        return { ok: false, error: TRIP_ERR.TripNotFound };
      }
      if (trip.travelerId !== user.id) {
        return { ok: false, error: COMMON_ERR.NotAuthorized };
      }
      await this.tripRepo.save([{ id: tripId, ...values }]);
      return { ok: true };
    } catch (err) {
      console.error(err);
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async deleteTrip(
    user: Users,
    { tripId }: DeleteTripInput,
  ): Promise<DeleteTripOutput> {
    try {
      const trip = await this.tripRepo.findOne(
        { id: tripId },
        { relations: ['steps'] },
      );
      if (!trip) {
        return { ok: false, error: TRIP_ERR.TripNotFound };
      }
      if (trip.travelerId !== user.id) {
        return { ok: false, error: COMMON_ERR.NotAuthorized };
      }
      let imagesToDelete = [];
      trip.steps.forEach((step) => {
        imagesToDelete = imagesToDelete.concat(step.imgUrls);
      });
      await this.awsS3Service.deleteImage({
        urls: imagesToDelete,
      });
      const { affected } = await this.tripRepo.delete({ id: tripId });
      if (affected === 1) {
        return { ok: true };
      }
    } catch (err) {
      console.error(err);
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }

  async search({ searchTerm }: SearchInput): Promise<SearchOutput> {
    try {
      const [users, usersCount] = await this.userRepo.findAndCount({
        where: [
          {
            firstName: Raw(
              (firstName) => `${firstName} ILIKE '%${searchTerm}%'`,
            ),
          },
          {
            lastName: Raw((lastName) => `${lastName} ILIKE '%${searchTerm}%'`),
          },
        ],
        take: 3,
      });
      const [trips, tripsCount] = await this.tripRepo.findAndCount({
        where: {
          name: Raw((name) => `${name} ILIKE '%${searchTerm}%'`),
          availability: Availability.Public,
        },
        take: 3,
        relations: ['traveler'],
      });
      return { ok: true, users, usersCount, trips, tripsCount };
    } catch {
      return { ok: false, error: COMMON_ERR.InternalServerErr };
    }
  }
}
