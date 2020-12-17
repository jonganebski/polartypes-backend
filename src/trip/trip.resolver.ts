import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import { Users } from 'src/users/entities/user.entity';
import { CreateTripInput, CreateTripOutput } from './dto/create-trip.dto';
import { DeleteTripInput, DeleteTripOutput } from './dto/delete-trip.dto';
import { ReadTripsInput, ReadTripsOutput } from './dto/read-trips.dto';
import { UpdateTripInput, UpdateTripOutput } from './dto/update-trip.dto';
import { TripService } from './trip.service';

@Resolver()
export class TripResolver {
  constructor(private readonly tripService: TripService) {}

  @UseGuards(AuthGuard)
  @Mutation(() => CreateTripOutput)
  createTrip(
    @AuthUser() user: Users,
    @Args('input') createTripInput: CreateTripInput,
  ): Promise<CreateTripOutput> {
    return this.tripService.createTrip(user, createTripInput);
  }

  @Query(() => ReadTripsOutput)
  readTrips(
    @AuthUser() user: Users,
    @Args('input') readTripsInput: ReadTripsInput,
  ): Promise<ReadTripsOutput> {
    return this.tripService.readTrips(user, readTripsInput);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => UpdateTripOutput)
  updateTrip(
    @AuthUser() user: Users,
    @Args('input') updateTripInput: UpdateTripInput,
  ): Promise<UpdateTripOutput> {
    return this.tripService.updateTrip(user, updateTripInput);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => DeleteTripOutput)
  deleteTrip(
    @AuthUser() user: Users,
    @Args('input') deleteTripInput: DeleteTripInput,
  ) {
    return this.tripService.deleteTrip(user, deleteTripInput);
  }
}
