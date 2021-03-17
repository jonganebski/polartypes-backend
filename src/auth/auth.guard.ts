import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtService } from 'src/jwt/jwt.service';
import { UserService } from 'src/users/user.service';
import { TAccessable } from './access.decorator';

// It will be used like `@UseGuards(AuthGuard)`.
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const access = this.reflector.get<TAccessable>(
      'access',
      context.getHandler(),
    );
    if (!access) {
      return true;
    }
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
        console.error(err);
        return false;
      }
    }
    if (access === 'Any') {
      return true;
    }
    return false;
  }
}
