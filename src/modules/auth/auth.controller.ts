import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Jwt2faAuthGuard } from './guards/jwt-2fa-auth.guard';
import { TwoFactorAuthDto } from './dtos/tow-factor-auth.dto';
import { User } from 'src/common/decorators/user.decorator';
import { Admin } from 'src/database/entities/admin.entity';
import { SignupDto } from './dtos/signup.dto';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SuccessfulSignupResponseDto } from './dtos/successful-siginup-response.dto';
import { SuccessfulLoginResponseDto } from './dtos/successful-login-response.dto';
import { Successful2faAuthResponseDto } from './dtos/successful-authentication-response.dto';
import { Successful2faGenerationResponseDto } from './dtos/successful-2fa-generation-response.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    type: SuccessfulLoginResponseDto,
  })
  async login(
    @Body() loginDto: LoginDto,
    @User() user: Admin,
  ): Promise<SuccessfulLoginResponseDto> {
    const isTwoFactorAuthenticationEnabled =
      !!user.isTwoFactorAuthenticationEnabled;

    const adminWithoutPsw: Partial<Admin> = {
      email: loginDto.email,
      password: loginDto.password,
    } as Admin;
    const { accessToken } = await this.authService.login(adminWithoutPsw);
    return {
      accessToken,
      isTwoFactorAuthenticationEnabled,
    };
  }

  @ApiBearerAuth('Authorization')
  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    type: Successful2faGenerationResponseDto,
  })
  async register(@User() user: Admin) {
    const { otpauthUrl } =
      await this.authService.generateTwoFactorAuthenticationSecret(
        user as Admin,
      );
    return await this.authService.generateQrCodeDataURL(otpauthUrl);
  }

  @ApiBearerAuth('Authorization')
  @Post('2fa/authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    type: Successful2faAuthResponseDto,
  })
  async authenticate(
    @User() user: Admin,
    @Body() twoFactorAuthDto: TwoFactorAuthDto,
    @Res() response: Response,
  ) {
    const isCodeValid =
      await this.authService.isTwoFactorAuthenticationCodeValid(
        twoFactorAuthDto.twoFactorAuthenticationCode,
        user,
      );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    const result = await this.authService.loginWith2fa(user);
    response.cookie('sessionToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    response.json(result);
  }

  @Post('signup')
  @ApiResponse({
    status: 201,
    type: SuccessfulSignupResponseDto,
  })
  async signup(
    @Body() signupDto: SignupDto,
  ): Promise<SuccessfulSignupResponseDto> {
    const admin = await this.authService.signup(signupDto);
    return {
      message: 'Registered successfully',
      email: admin.email,
      username: admin.username,
    };
  }

  @Get('2fa/protected')
  @UseGuards(Jwt2faAuthGuard)
  check2faToken() {
    return 'ok';
  }
}
