import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { Users } from 'src/users/entities/user.entity';
import { Raw, Repository } from 'typeorm';
import { CreateTripInput, CreateTripOutput } from './dto/create-trip.dto';
import { DeleteTripInput, DeleteTripOutput } from './dto/delete-trip.dto';
import { ReadTripInput, ReadTripOutput } from './dto/read-trip.dto';
import { ReadTripsInput, ReadTripsOutput } from './dto/read-trips.dto';
import { SearchInput, SearchOutput } from './dto/search.dto';
import { UpdateTripInput, UpdateTripOutput } from './dto/update-trip.dto';
import { Availability, Trip } from './entities/trip.entity';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip) private readonly tripRepo: Repository<Trip>,
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
    private readonly awsS3Service: AwsS3Service,
  ) {}

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
      console.log(err);
      return { ok: false, error: 'Failed to create trip.' };
    }
  }

  async readTrips(
    user: Users,
    { targetUsername }: ReadTripsInput,
  ): Promise<ReadTripsOutput> {
    try {
      const targetUser = await this.userRepo.findOne(
        {
          slug: targetUsername.toLocaleLowerCase(),
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
      if (!targetUser) {
        return { ok: false, error: 'User not found.' };
      }
      const isSelf = Boolean(user?.id === targetUser.id);
      const isFollower = Boolean(
        targetUser.followers?.some((follower) => follower.id === user?.id),
      );
      if (isSelf) {
        // Reading user's own trips. (private)
        return { ok: true, targetUser };
      }
      if (isFollower) {
        // Reading follower's trip. (followers)
        targetUser.trips = targetUser.trips.filter(
          (trip) => trip.availability !== Availability.Private,
        );
      } else {
        // Reading somebody's trip. (public)
        targetUser.trips = targetUser.trips.filter(
          (trip) => trip.availability === Availability.Public,
        );
      }
      return { ok: true, targetUser };
    } catch (err) {
      console.log(err);
      return { ok: false, error: 'Failed to load trips.' };
    }
  }

  async readTrip(
    user: Users,
    { tripId }: ReadTripInput,
  ): Promise<ReadTripOutput> {
    try {
      const trip = await this.tripRepo.findOne(
        {
          id: tripId,
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
      if (!trip) {
        return { ok: false, error: 'Trip not found.' };
      }
      const targetUser = await this.userRepo.findOne(
        { id: trip.travelerId },
        { relations: ['followers'] },
      );
      if (!targetUser) {
        return { ok: false, error: 'User not found.' };
      }
      const isSelf = Boolean(user?.id === trip.travelerId);
      const isPublicAllowed = Boolean(
        trip.availability === Availability.Public,
      );
      const isFollowersAllowedAndIsFollower = Boolean(
        targetUser.followers?.some((follower) => follower.id === user?.id) &&
          trip.availability !== Availability.Private,
      );
      if (isSelf || isPublicAllowed || isFollowersAllowedAndIsFollower) {
        if (!isSelf) {
          this.tripRepo.increment({ id: tripId }, 'viewCount', 1);
        }
        return { ok: true, trip };
      } else {
        return { ok: false, error: 'You are not authorized.' };
      }
    } catch (err) {
      console.log(err);
      return { ok: false, error: 'Failed to load steps.' };
    }
  }

  async updateTrip(
    user: Users,
    updateTripInput: UpdateTripInput,
  ): Promise<UpdateTripOutput> {
    try {
      const trip = await this.tripRepo.findOne({ id: updateTripInput.tripId });
      if (!trip) {
        return { ok: false, error: 'Trip not found.' };
      }
      if (trip.travelerId !== user.id) {
        return { ok: false, error: 'Not authorized.' };
      }
      await this.tripRepo.save([
        { id: updateTripInput.tripId, ...updateTripInput },
      ]);
      return { ok: true };
    } catch (error) {
      return { ok: false, error };
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
        return { ok: false, error: 'Trip not found.' };
      }
      if (trip.travelerId !== user.id) {
        return { ok: false, error: 'Not authorized.' };
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
      console.log(err);
      return { ok: false, error: 'Failed to delete trip.' };
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
      return { ok: false, error: 'Failed to search.' };
    }
  }
}
