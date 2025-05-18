import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from 'auth/guards/jwt-auth.guard';
import { Observable } from 'rxjs';
import { RoleEnum } from './role.enum';

@Injectable()
export class RoleGuard extends JwtAuthGuard {
  constructor(private reflector: Reflector) {
    //Reflector je helper klasa koja omogućava pristup metapodacima
    super(); //Kada koristiš super(), pozivaš konstruktor nadklase(u ovom slucaju JwtAuthGuard), tj. roditeljske klase, i omogućavaš da ona izvrši svoj kod pre nego što izvršiš svoj vlastiti kod.
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<RoleEnum[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const hasRole = roles.some((role) => user.roles?.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('Access denied, insufficient role');
    }
    return true;
  }
}
