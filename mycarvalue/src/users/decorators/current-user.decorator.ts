import { createParamDecorator, ExecutionContext, Query } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: any, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request.currentUser;
  },
);
