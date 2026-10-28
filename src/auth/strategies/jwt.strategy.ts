import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'super-secret-helpdesk-key-for-dev-change-in-prod',
      ),
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.usersService
      .findById(payload.sub)
      .catch(() => null);
    if (!user) {
      throw new UnauthorizedException(
        'El token no corresponde a un usuario activo.',
      );
    }
    return user;
  }
}
