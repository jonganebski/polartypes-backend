import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateTripInput, CreateTripOutput } from './dto/create-trip.dto';
import { DeleteTripInput, DeleteTripOutput } from './dto/delete-trip.dto';
import { ReadTripInput, ReadTripOutput } from './dto/read-trip.dto';
import { ReadTripsInput, ReadTripsOutput } from './dto/read-trips.dto';
import { UpdateTripInput, UpdateTripOutput } from './dto/update-trip.dto';
import { Availability, Trip } from './entities/trip.entity';

@Injectable()
export class TripService {
  constructor(
    @InjectRepository(Trip) private readonly tripRepo: Repository<Trip>,
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
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
        { relations: ['trips', 'trips.steps', 'followers', 'followings'] },
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
        this.tripRepo.increment({ id: tripId }, 'viewCount', 1);
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
      const trip = await this.tripRepo.findOne({ id: tripId });
      if (!trip) {
        return { ok: false, error: 'Trip not found.' };
      }
      if (trip.travelerId !== user.id) {
        return { ok: false, error: 'Not authorized.' };
      }
      // request delete images to aws s3.
      console.log('Delete trip under development.');
      return { ok: true, error: 'Not deleted. Delete trip under development.' };
    } catch {
      return { ok: false, error: 'Failed to delete trip.' };
    }
  }
}
