import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (_: undefined, req: ExecutionContext) => {
    return req.switchToHttp().getRequest().user;
  },
);
