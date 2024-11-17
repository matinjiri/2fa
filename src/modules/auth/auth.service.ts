import { ConflictException, Injectable } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { JwtService } from '@nestjs/jwt';
import { authenticator } from 'otplib';
import { toDataURL } from 'qrcode';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { Admin } from 'src/database/entities/admin.entity';
import { SignupDto } from './dtos/signup.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private adminService: AdminService,
    private jwtService: JwtService,
  ) {}
  async validateAdmin(email: string, pass: string): Promise<Partial<Admin>> {
    const admin = await this.adminService.getAdminByEmail(email);
    try {
      const isMatch = await bcrypt.compare(pass, admin.password);
      if (admin && isMatch) {
        const { password, ...adminWithoutPassword } = admin;
        return adminWithoutPassword;
      }
    } catch (e) {
      return null;
    }
  }
  async login(
    adminWithoutPsw: Partial<Admin>,
    isTwoFactorAuthenticated = false,
  ) {
    const payload: IJwtPayload = {
      email: adminWithoutPsw.email,
      isTwoFactorAuthenticationEnabled:
        !!adminWithoutPsw.isTwoFactorAuthenticationEnabled,
      isTwoFactorAuthenticated,
    };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.TOKEN_SECRET,
        expiresIn: process.env.TOKEN_EXPIRATION + 's',
      }),
    };
  }
  async generateTwoFactorAuthenticationSecret(admin: Admin) {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(admin.email, 'MCI_HR', secret);
    await this.adminService.setTwoFactorAuthenticationSecret(secret, admin.id);
    return {
      secret,
      otpauthUrl,
    };
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    const data = await toDataURL(otpAuthUrl);
    return { data };
  }

  async isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    admin: Admin,
  ) {
    return await authenticator.verify({
      token: twoFactorAuthenticationCode,
      secret: admin.twoFactorAuthenticationSecret,
    });
  }

  async loginWith2fa(adminWithoutPsw: Partial<Admin>) {
    const payload: IJwtPayload = {
      email: adminWithoutPsw.email,
      isTwoFactorAuthenticationEnabled:
        !!adminWithoutPsw.isTwoFactorAuthenticationEnabled, // must be boolean
      isTwoFactorAuthenticated: true,
    };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: process.env.TFA_TOKEN_SECRET,
        expiresIn: process.env.TFA_TOKEN_EXPIRATION + 's',
      }),
    };
  }

  async signup(signupDto: SignupDto) {
    const { email, password } = signupDto;
    const existingAdmin = await this.adminService.getAdminByEmail(email);
    if (existingAdmin) {
      throw new ConflictException('Email is already registered');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    return await this.adminService.saveNewAdmin({
      email,
      password: hashedPassword,
    } as Admin);
  }
}
