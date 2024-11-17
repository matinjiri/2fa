import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Admin } from 'src/database/entities/admin.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(email: string, password: string): Promise<Partial<Admin>> {
    const adminWithoutPsw = await this.authService.validateAdmin(
      email,
      password,
    );
    if (!adminWithoutPsw) {
      throw new UnauthorizedException();
    }
    return adminWithoutPsw;
  }
}
