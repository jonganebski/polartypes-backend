import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from 'src/jwt/jwt.service';
import { UserService } from 'src/users/user.service';

// It will be used like `@UseGuards(AuthGuard)`.
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const token = gqlContext.token;
    if (token) {
      try {
        const decoded = this.jwtService.verify(token.toString());
        if (typeof decoded === 'object' && decoded.hasOwnProperty('userId')) {
          const { user, error } = await this.userService.findById(
            decoded['userId'],
          );
          if (user && !error) {
            gqlContext['user'] = user;
            return true;
          }
          return false;
        }
      } catch (err) {
        console.log(err);
        return false;
      }
    }
    return false;
  }
}
