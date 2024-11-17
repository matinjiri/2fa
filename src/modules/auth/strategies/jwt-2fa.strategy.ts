import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminService } from 'src/modules/admin/admin.service';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';
import { Request } from 'express';

@Injectable()
export class Jwt2faStrategy extends PassportStrategy(Strategy, 'jwt-2fa') {
  constructor(private readonly adminService: AdminService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.sessionToken;
        },
      ]),
      secretOrKey: process.env.TFA_TOKEN_SECRET,
    });
  }

  async validate(payload: IJwtPayload) {
    const admin = await this.adminService.getAdminByEmail(payload.email);
    if (!admin) {
      throw new NotFoundException('admin not found');
    }

    if (!admin.isTwoFactorAuthenticationEnabled) {
      return admin;
    }
    if (payload.isTwoFactorAuthenticated) {
      return admin;
    }
  }
}
