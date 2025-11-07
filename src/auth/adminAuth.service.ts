import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AdminAuthDto } from './dto/admin-auth.dto';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

@Injectable()
export class AdminAuthService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}
  async login(dto: AdminAuthDto) {
    const admin = await this.prisma.admin.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!admin) {
      throw new UnauthorizedException('Invalid email');
    }
    const passwordMatch = await argon2.verify(admin.password, dto.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid password');
    }
    const token = await this.signToken(admin.id, admin.email);
    const refreshToken = await this.createRefreshToken(admin.id);
    return {
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
      },
      access_token: token,
      refresh_token: refreshToken,
    };
  }
  async signToken(adminId: number, email: string) {
    const payload = {
      sub: adminId,
      email,
    };
    const secret = this.config.get<string>('JWT_SECRET_ADMIN');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });
    return token;
  }
  async createRefreshToken(adminId: number) {
    const payload = {
      sub: adminId,
    };
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET_ADMIN');
    const refreshToken: string = await this.jwt.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: '7d',
    });
    const hashedToken: string = await argon2.hash(refreshToken);

    await this.prisma.adminRefreshToken.create({
      data: {
        adminId,
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
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET_ADMIN');
    let decoded: any;
    try {
      decoded = await this.jwt.verifyAsync<{ sub: number }>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    const activeTokens = await this.prisma.adminRefreshToken.findMany({
      where: {
        adminId: decoded.sub,
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

    const admin = await this.prisma.admin.findUnique({
      where: { id: decoded.sub },
    });

    if (!admin) {
      throw new UnauthorizedException('Admin not found');
    }

    return this.signToken(admin.id, admin.email);
  }
  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new BadRequestException('No refresh token provided');
    }
    // Decode JWT first to get admin ID, then query only that admin's tokens
    const refreshSecret = this.config.get<string>('JWT_REFRESH_SECRET_ADMIN');
    let decoded: any;
    try {
      decoded = await this.jwt.verifyAsync<{ sub: number }>(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Query only tokens for this specific admin
    const tokens = await this.prisma.adminRefreshToken.findMany({
      where: {
        adminId: decoded.sub,
        revokedAt: null,
      },
    });

    // Find and revoke the matching token
    for (const token of tokens) {
      const match = await argon2.verify(token.tokenHash, refreshToken);
      if (match) {
        await this.prisma.adminRefreshToken.update({
          where: { id: token.id },
          data: { revokedAt: new Date() },
        });
        return;
      }
    }
  }
}
