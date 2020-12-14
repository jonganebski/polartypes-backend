import { Query, Resolver } from '@nestjs/graphql';
import { Trip } from './entities/trip.entity';
import { TripService } from './trip.service';

@Resolver()
export class TripResolver {
  constructor(private readonly tripService: TripService) {}
  @Query(() => [Trip])
  getAll(): Promise<Trip[]> {
    return this.tripService.getAll();
  }
}
