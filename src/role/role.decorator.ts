import { SetMetadata } from "@nestjs/common";
import { RoleEnum } from "./role.enum";


export const Roles = (...roles: RoleEnum[]) => SetMetadata('roles', roles);