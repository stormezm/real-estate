import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserEntity } from '@prisma/client';

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
