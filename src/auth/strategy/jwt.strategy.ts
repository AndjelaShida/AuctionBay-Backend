// Definise kako ce NestJS verifikovati JWT tokene.
//Prvo se radi JwtStrategy, pa tek onda JwtGurad
//Kada korisnik salje zahtev sa JWT tokenom, strategija proverava da li je token valida
//Ako token nije validan(istekao/lazan/neispravan), odbacuje zahtev.
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigServiceCustom } from 'config/config.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  //Pravimo novu Passport strategiju, baziranu na Strategy iz passport-jwt, i zvaćemo je 'jwt'", 'jwt' → identifikator ove strategije koji se koristi unutar AuthGuard('jwt')

  constructor(
    private readonly userService: UserService,
    private readonly configServiceCustom: ConfigServiceCustom,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configServiceCustom.get('JWT_SECRET'),
    });
  }
  //validate metoda koja se poziva prilikom validacije tokena
  async validate(payload: { sub: number; username: string }): Promise<any> {
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}
