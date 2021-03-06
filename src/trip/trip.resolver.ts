import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Access } from 'src/auth/access.decorator';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { Users } from 'src/users/entities/user.entity';
import { CreateTripInput, CreateTripOutput } from './dto/create-trip.dto';
import { DeleteTripInput, DeleteTripOutput } from './dto/delete-trip.dto';
import { ReadTripInput, ReadTripOutput } from './dto/read-trip.dto';
import { ReadTripsInput, ReadTripsOutput } from './dto/read-trips.dto';
import { SearchInput, SearchOutput } from './dto/search.dto';
import { UpdateTripInput, UpdateTripOutput } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';
import { TripService } from './trip.service';

@Resolver(() => Trip)
export class TripResolver {
  constructor(private readonly tripService: TripService) {}

  @Access('Signedin')
  @Mutation(() => CreateTripOutput)
  createTrip(
    @AuthUser() user: Users,
    @Args('input') createTripInput: CreateTripInput,
  ): Promise<CreateTripOutput> {
    return this.tripService.createTrip(user, createTripInput);
  }

  @Access('Any')
  @Query(() => ReadTripsOutput)
  readTrips(
    @AuthUser() user: Users,
    @Args('input') readTripsInput: ReadTripsInput,
  ): Promise<ReadTripsOutput> {
    return this.tripService.readTrips(user, readTripsInput);
  }

  @Access('Any')
  @Query(() => ReadTripOutput)
  readTrip(
    @AuthUser() user: Users,
    @Args('input') readTripInput: ReadTripInput,
  ) {
    return this.tripService.readTrip(user, readTripInput);
  }

  @Access('Signedin')
  @Mutation(() => UpdateTripOutput)
  updateTrip(
    @AuthUser() user: Users,
    @Args('input') updateTripInput: UpdateTripInput,
  ): Promise<UpdateTripOutput> {
    return this.tripService.updateTrip(user, updateTripInput);
  }

  @Access('Signedin')
  @Mutation(() => DeleteTripOutput)
  deleteTrip(
    @AuthUser() user: Users,
    @Args('input') deleteTripInput: DeleteTripInput,
  ) {
    return this.tripService.deleteTrip(user, deleteTripInput);
  }

  @Access('Any')
  @Query(() => SearchOutput)
  search(@Args('input') searchInput: SearchInput): Promise<SearchOutput> {
    return this.tripService.search(searchInput);
  }
}
