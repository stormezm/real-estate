import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AdminAuthService } from './adminAuth.service';
import { AdminAuthDto } from './dto/admin-auth.dto';

interface RequestWithCookies extends Request {
  cookies: {
    refresh_token?: string;
  };
}

@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @HttpCode(200)
  @Post('login')
  async login(
    @Body() dto: AdminAuthDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminAuthService.login(dto);
    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return {
      admin: result.admin,
      access_token: result.access_token,
    };
  }
  @HttpCode(200)
  @Post('refresh')
  async refresh(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken)
      throw new UnauthorizedException('No refresh token provided');
    const accessToken = await this.adminAuthService.refreshTokens(refreshToken);
    return {
      message: 'Access token refreshed successfully',
      access_token: accessToken,
    };
  }
  @HttpCode(200)
  @Post('logout')
  async logout(
    @Req() req: RequestWithCookies,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken)
      throw new UnauthorizedException('No refresh token provided');
    await this.adminAuthService.logout(refreshToken);
    res.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }
}
