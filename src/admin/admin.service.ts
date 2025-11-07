import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon2 from 'argon2';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAdminDto: CreateAdminDto) {
    const adminExists = await this.prisma.admin.findFirst({
      where: {
        OR: [
          { username: createAdminDto.username },
          { email: createAdminDto.email },
        ],
      },
    });

    if (adminExists) {
      throw new ConflictException(
        adminExists.username === createAdminDto.username
          ? 'Username already exists'
          : 'Email already exists',
      );
    }
    const hashedPassword = await argon2.hash(createAdminDto.password);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const admin = await this.prisma.admin.create({
      data: {
        username: createAdminDto.username,
        email: createAdminDto.email,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
      },
    });

    return { message: 'Admin created successfully', admin };
  }

  async update(id: number, updateAdminDto: UpdateAdminDto) {
    const adminExists = await this.prisma.admin.findUnique({
      where: { id },
    });
    if (!adminExists) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }
    if (updateAdminDto.password) {
      const hashedPassword = await argon2.hash(updateAdminDto.password);
      updateAdminDto.password = hashedPassword;
    }
    const admin = await this.prisma.admin.update({
      where: { id },
      data: updateAdminDto,
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    return { message: 'Admin updated successfully', admin };
  }

  async remove(id: number) {
    const adminExists = await this.prisma.admin.findUnique({
      where: { id },
    });

    if (!adminExists) {
      throw new NotFoundException(`Admin with ID ${id} not found`);
    }

    await this.prisma.admin.delete({
      where: { id },
    });

    return { message: 'Admin deleted successfully' };
  }
}
