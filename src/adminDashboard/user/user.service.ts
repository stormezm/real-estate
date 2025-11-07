import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const userExists = await this.prisma.user.findFirst({
      where: {
        OR: [
          { username: createUserDto.username },
          { email: createUserDto.email },
        ],
      },
    });
    if (userExists) {
      throw new ConflictException(
        userExists.username === createUserDto.username
          ? 'Username already exists'
          : 'Email already exists',
      );
    }

    const hashedPassword = await argon2.hash(createUserDto.password);
    const user = await this.prisma.user.create({
      data: {
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
      },
    });
    return { message: 'User created successfully', user };
  }

  async findAll(paginationDto: PaginationDto, fundId?: number) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where = fundId
      ? {
          UserFund: {
            some: { fundId },
          },
        }
      : undefined;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { id: 'asc' },
        where,
        include: {
          UserFund: {
            where: fundId ? { fundId } : undefined,
            include: {
              fund: { select: { name: true } },
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const data = users.map((user) => {
      const funds = user.UserFund.filter((uf) => uf.fund != null).map((uf) => ({
        fundId: uf.fundId,
        fundName: uf.fund.name,
      }));
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        funds,
      };
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const userExists = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!userExists) {
      throw new NotFoundException('User not found');
    }
    if (updateUserDto?.password) {
      const hashedPassword = await argon2.hash(updateUserDto.password);
      updateUserDto.password = hashedPassword;
    }
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: {
        id: true,
        username: true,
        email: true,
      },
    });
    return { message: 'User updated successfully', user };
  }

  async remove(id: number) {
    const user = await this.prisma.user.delete({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}
