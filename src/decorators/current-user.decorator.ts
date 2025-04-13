import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ContextCreator } from "@nestjs/core/helpers/context-creator";

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx:ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user ;
    },
);