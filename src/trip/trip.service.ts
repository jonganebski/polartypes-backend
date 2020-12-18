import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/user.service';
import { Repository } from 'typeorm';
import { CreateTripInput, CreateTripOutput } from './dto/create-trip.dto';
import { DeleteTripInput, DeleteTripOutput } from './dto/delete-trip.dto';
import { ReadTripsInput, ReadTripsOutput } from './dto/read-trips.dto';
import { UpdateTripInput, UpdateTripOutput } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';

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
      await this.tripRepo.save(newTrip);
      return { ok: true };
    } catch {
      return { ok: false, error: 'Failed to create trip.' };
    }
  }

  async readTrips(
    user: Users,
    { targetUsername }: ReadTripsInput,
  ): Promise<ReadTripsOutput> {
    try {
      let availability: number;
      const targetUser = await this.userRepo.findOne(
        {
          username: targetUsername,
        },
        { select: ['followings', 'id'] },
      );
      if (!targetUser) {
        return { ok: false, error: 'User not found.' };
      }
      if (user?.id === targetUser.id) {
        // Reading user's own trips. (private)
        availability = 0;
      } else if (targetUser.followings?.includes(user)) {
        // Reading follower's trip. (followers)
        availability = 1;
      } else {
        // Reading somebody's trip. (public)
        availability = 2;
      }
      const trips = await this.tripRepo.find({
        traveler: targetUser,
        availability,
      });
      return { ok: true, trips };
    } catch {
      return { ok: false, error: 'Failed to load trips.' };
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
      console.log('Delete trip under development.');
      return { ok: true, error: 'Not deleted. Delete trip under development.' };
    } catch {
      return { ok: false, error: 'Failed to delete trip.' };
    }
  }
}
