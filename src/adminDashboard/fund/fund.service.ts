import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFundDto } from './dto/create-fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class FundService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createFundDto: CreateFundDto) {
    const fund = await this.prisma.fund.create({
      data: {
        ...createFundDto,
        startDate: createFundDto.startDate
          ? new Date(createFundDto.startDate)
          : undefined,
      },
    });
    return { message: 'Fund created successfully', fund };
  }

  async getAll(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const [funds, total] = await Promise.all([
      this.prisma.fund.findMany({
        skip,
        take: limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.fund.count(),
    ]);

    return {
      data: funds,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOne(id: number) {
    const fund = await this.prisma.fund.findUnique({
      where: { id },
    });
    if (!fund) {
      throw new NotFoundException('Fund not found');
    }
    return fund;
  }

  async update(id: number, updateFundDto: UpdateFundDto) {
    const existingFund = await this.prisma.fund.findUnique({
      where: { id },
    });
    if (!existingFund) {
      throw new NotFoundException('Fund not found');
    }
    const fund = await this.prisma.fund.update({
      where: { id },
      data: updateFundDto,
    });
    return { message: 'Fund updated successfully', fund };
  }

  async remove(id: number) {
    const existingFund = await this.prisma.fund.findUnique({
      where: { id },
    });
    if (!existingFund) {
      throw new NotFoundException('Fund not found');
    }
    await this.prisma.fund.delete({
      where: { id },
    });
    return { message: 'Fund deleted successfully' };
  }
}
