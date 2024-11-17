import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AdminService } from 'src/modules/admin/admin.service';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly adminService: AdminService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.TOKEN_SECRET,
    });
  }

  async validate(payload: IJwtPayload) {
    const admin = await this.adminService.getAdminByEmail(payload.email);
    if (admin) {
      return admin;
    } else {
      throw new NotFoundException('Admin not found');
    }
  }
}
