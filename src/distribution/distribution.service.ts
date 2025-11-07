import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDistributionDto } from './dto/create-distribution.dto';
import { UpdateDistributionDto } from './dto/update-distribution.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileUploadUtil } from 'src/common/utils/file-upload.util';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class DistributionService {
  constructor(private readonly prisma: PrismaService) {}
  async createDistribution(
    dto: CreateDistributionDto,
    file?: Express.Multer.File,
  ) {
    const { fundId, userId, distributionDate, amountPaid, paymentMethod } = dto;

    const userFund = await this.prisma.userFund.findUnique({
      where: { userId_fundId: { userId, fundId } },
      include: { fund: true },
    });
    if (!userFund) {
      throw new NotFoundException('UserFund not found');
    }
    let statementUrl = dto.statementUrl || '';
    if (file) {
      statementUrl = await FileUploadUtil.saveFile(
        file,
        userFund.id.toString(),
        'distributions',
        ['application/pdf'],
      );
    }

    const distribution = await this.prisma.distribution.create({
      data: {
        userFundId: userFund.id,
        distributionDate: new Date(distributionDate),
        amountPaid: Number(amountPaid),
        paymentMethod,
        statementUrl,
      },
      include: {
        userFund: {
          include: {
            fund: true,
          },
        },
      },
    });

    return {
      data: distribution,
      fundName: userFund.fund.name,
    };
  }

  async updateDistribution(id: number, dto: UpdateDistributionDto) {
    const existing = await this.prisma.distribution.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Distribution not found');

    const updated = await this.prisma.distribution.update({
      where: { id },
      data: {
        distributionDate: dto.distributionDate
          ? new Date(dto.distributionDate)
          : existing.distributionDate,
        amountPaid:
          dto.amountPaid != null
            ? Number(dto.amountPaid)
            : Number(existing.amountPaid),
        paymentMethod: dto.paymentMethod ?? existing.paymentMethod,
        statementUrl: dto.statementUrl ?? existing.statementUrl,
      },
    });
    return { message: 'Distribution updated successfully', data: updated };
  }

  async removeDistribution(id: number) {
    const distribution = await this.prisma.distribution.findUnique({
      where: { id },
    });
    if (!distribution) throw new NotFoundException('Distribution not found');
    if (distribution.statementUrl) {
      await FileUploadUtil.deleteFile(distribution.statementUrl);
    }

    await this.prisma.distribution.delete({ where: { id } });

    return { message: 'Distribution deleted successfully' };
  }
  async getDistributionsByUserFund(
    userFundId: number,
    paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [distributions, total] = await Promise.all([
      this.prisma.distribution.findMany({
        where: { userFundId },
        skip,
        take: limit,
        orderBy: { distributionDate: 'desc' },
        include: { userFund: { include: { fund: true } } },
      }),
      this.prisma.distribution.count({
        where: { userFundId },
      }),
    ]);

    const data = distributions.map((d) => ({
      id: d.id,
      distributionDate: d.distributionDate,
      fundName: d.userFund.fund.name,
      amountPaid: Number(d.amountPaid),
      paymentMethod: d.paymentMethod,
      statementUrl: d.statementUrl,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getDistributionsByUser(userId: number, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Query distributions directly with join to userFund and fund
    // This does pagination at the database level instead of in memory
    const [distributions, total] = await Promise.all([
      this.prisma.distribution.findMany({
        where: {
          userFund: {
            userId,
          },
        },
        skip,
        take: limit,
        orderBy: { distributionDate: 'desc' },
        include: {
          userFund: {
            include: {
              fund: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.distribution.count({
        where: {
          userFund: {
            userId,
          },
        },
      }),
    ]);

    const data = distributions.map((d) => ({
      id: d.id,
      distributionDate: d.distributionDate,
      fundName: d.userFund.fund.name,
      amountPaid: Number(d.amountPaid),
      paymentMethod: d.paymentMethod,
      statementUrl: d.statementUrl,
    }));

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getAllDistributions(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    const [distributions, total] = await Promise.all([
      this.prisma.distribution.findMany({
        skip,
        take: limit,
        include: {
          userFund: {
            include: {
              user: {
                select: { id: true, username: true },
              },
              fund: {
                select: { id: true, name: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.distribution.count(),
    ]);

    const data = distributions.map((d) => ({
      id: d.id,
      userFund: {
        id: d.userFund.id,
      },
      fund: {
        id: d.userFund.fund.id,
        name: d.userFund.fund.name,
      },
      user: {
        id: d.userFund.user.id,
        username: d.userFund.user.username,
      },
      distributionDate: d.distributionDate,
      amountPaid: d.amountPaid,
      paymentMethod: d.paymentMethod,
      statementUrl: d.statementUrl,
      createdAt: d.createdAt,
    }));

    return {
      data: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
