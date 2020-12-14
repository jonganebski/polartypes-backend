import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class UserResolver {
  @Query(() => Boolean)
  isUser(): boolean {
    return true;
  }
}
