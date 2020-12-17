import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

// Make custom decorator that returns current user.
export const AuthUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    // Argument context is http context. It needs to be converted to gtaphQL context.
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const user = gqlContext['user'];
    return user;
  },
);
