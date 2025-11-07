import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto } from './dto/auth.dto';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}
  async login(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email');
    }
    const passwordMatch = await argon2.verify(user.password, dto.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid password');
    }
    const token = await this.signToken(user.id, user.email);
    const refreshToken = await this.createRefreshToken(user.id);
    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      access_token: token,
      refresh_token: refreshToken,
    };
  }
  async signToken(userId: number, email: string) {
    const payload = {
      sub: userId,
      email,
    };
    const secret = this.config.get<string>('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
    return token;
  }
  async createRefreshToken(userId: number) {
    const payload = {
      sub: userId,
    };
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });
    const hashedToken = await argon2.hash(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: hashedToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return refreshToken;
  }
  async refreshTokens(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    let decoded: any;
    try {
      decoded = await this.jwt.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const activeTokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: decoded.sub,
        revokedAt: null,
      },
    });

    const matches = await Promise.all(
      activeTokens.map((token) => argon2.verify(token.tokenHash, refreshToken)),
    );
    const isValid = matches.includes(true);

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.signToken(user.id, user.email);
  }
  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('No refresh token provided');
    }
    // Decode JWT first to get user ID, then query only that user's tokens
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET');
    let decoded: any;
    try {
      decoded = await this.jwt.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Query only tokens for this specific user
    const tokens = await this.prisma.refreshToken.findMany({
      where: {
        userId: decoded.sub,
        revokedAt: null,
      },
    });

    // Find and revoke the matching token
    for (const token of tokens) {
      const match = await argon2.verify(token.tokenHash, refreshToken);
      if (match) {
        await this.prisma.refreshToken.update({
          where: { id: token.id },
          data: { revokedAt: new Date() },
        });
        return;
      }
    }
  }

  async sendOtp(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new NotFoundException('Email not found');
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await this.prisma.user.update({
      where: { email: user.email },
      data: { otp, otpExpiry },
    });
    const smtpHost = this.config.get<string>('SMTP_HOST');
    const smtpPort = this.config.get<number>('SMTP_PORT');
    const smtpUser = this.config.get<string>('SMTP_USER');
    const smtpPass = this.config.get<string>('SMTP_PASS');
    const from = this.config.get<string>('SMTP_FROM');
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    try {
      await transporter.sendMail({
        from: from,
        to: email,
        subject: 'OTP Verification',
        text: `Your OTP is ${otp}`,
      });
    } catch (_error) {
      await this.prisma.user.update({
        where: { email },
        data: { otp: null, otpExpiry: null },
      });
      throw new InternalServerErrorException('Failed to send OTP');
    }
    return { message: 'OTP sent successfully' };
  }
  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Invalid email or OTP');

    if (!user.otp || !user.otpExpiry)
      throw new BadRequestException('No OTP requested');
    if (user.otp !== otp) throw new BadRequestException('Invalid OTP');
    if (user.otpExpiry < new Date())
      throw new BadRequestException('OTP expired');

    return { message: 'OTP verified successfully' };
  }
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string,
    confirmPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new BadRequestException('Invalid email or OTP');

    if (user.otp !== otp) throw new BadRequestException('Invalid OTP');
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      throw new BadRequestException('OTP expired');
    }
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashedPassword = await argon2.hash(newPassword);

    await this.prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiry: null,
      },
    });

    return { message: 'Password has been reset successfully' };
  }
}
