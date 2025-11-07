import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCapitalCallDto } from './dto/create-capitalcall.dto';
import { UpdateCapitalcallDto } from './dto/update-capitalcall.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class CapitalcallService {
  constructor(private readonly prisma: PrismaService) {}

  private mapStatus(status?: string): 'Pending' | 'Paid' | 'LatePayment' {
    if (!status) return 'Pending';
    if (status === 'Late Payment') return 'LatePayment';
    if (status === 'Pending') return 'Pending';
    if (status === 'Paid') return 'Paid';
    return 'Pending';
  }

  async createCapitalCall(dto: CreateCapitalCallDto) {
    const { userId, fundId, amountCalled, callDate, dueDate, status } = dto;

    const userFund = await this.prisma.userFund.findUnique({
      where: { userId_fundId: { userId, fundId } },
      include: { fund: true },
    });

    if (!userFund) {
      throw new NotFoundException('UserFund not found for this user and fund');
    }

    const capitalCall = await this.prisma.capitalCall.create({
      data: {
        userFundId: userFund.id,
        amountCalled: Number(amountCalled),
        callDate: new Date(callDate),
        dueDate: dueDate ? new Date(dueDate) : new Date(callDate),
        status: this.mapStatus(status),
      },
      include: {
        userFund: { include: { fund: true } },
      },
    });

    return {
      data: capitalCall,
      fundName: userFund.fund.name,
    };
  }

  async updateCapitalCall(id: number, dto: UpdateCapitalcallDto) {
    const existing = await this.prisma.capitalCall.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException('Capital Call not found');
    }

    const updated = await this.prisma.capitalCall.update({
      where: { id },
      data: {
        amountCalled:
          dto.amountCalled != null
            ? Number(dto.amountCalled)
            : existing.amountCalled,
        callDate: dto.callDate ? new Date(dto.callDate) : existing.callDate,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : existing.dueDate,
        status:
          dto.status !== undefined
            ? this.mapStatus(dto.status as string)
            : existing.status,
      },
    });

    return {
      message: 'Capital Call updated successfully',
      data: updated,
    };
  }

  async removeCapitalCall(id: number) {
    const existing = await this.prisma.capitalCall.findUnique({
      where: { id },
    });
    if (!existing) throw new NotFoundException('Capital Call not found');

    await this.prisma.capitalCall.delete({ where: { id } });

    return { message: 'Capital Call deleted successfully' };
  }

  async getCapitalCallsByUserFund(
    userFundId: number,
    paginationDto: PaginationDto,
  ) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [capitalCalls, total] = await Promise.all([
      this.prisma.capitalCall.findMany({
        where: { userFundId },
        skip,
        take: limit,
        orderBy: { callDate: 'desc' },
        include: {
          userFund: {
            include: {
              fund: true,
            },
          },
        },
      }),
      this.prisma.capitalCall.count({
        where: { userFundId },
      }),
    ]);

    const data = capitalCalls.map((cc) => ({
      id: cc.id,
      callDate: cc.callDate,
      dueDate: cc.dueDate,
      fundName: cc.userFund.fund.name,
      amountCalled: Number(cc.amountCalled),
      status: cc.status,
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

  async getCapitalCallsByUser(userId: number, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Query capital calls directly with join to userFund and fund
    // This does pagination at the database level instead of in memory
    const [capitalCalls, total] = await Promise.all([
      this.prisma.capitalCall.findMany({
        where: {
          userFund: {
            userId,
          },
        },
        skip,
        take: limit,
        orderBy: { callDate: 'desc' },
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
      this.prisma.capitalCall.count({
        where: {
          userFund: {
            userId,
          },
        },
      }),
    ]);

    const data = capitalCalls.map((cc) => ({
      id: cc.id,
      callDate: cc.callDate,
      dueDate: cc.dueDate,
      fundName: cc.userFund.fund.name,
      amountCalled: Number(cc.amountCalled),
      status: cc.status,
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
  async getAllCapitalCalls(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [capitalCalls, total] = await Promise.all([
      this.prisma.capitalCall.findMany({
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
      this.prisma.capitalCall.count(),
    ]);

    const data = capitalCalls.map((c) => ({
      id: c.id,
      userFund: {
        id: c.userFund.id,
      },
      fund: {
        id: c.userFund.fund.id,
        name: c.userFund.fund.name,
      },
      user: {
        id: c.userFund.user.id,
        username: c.userFund.user.username,
      },
      amountCalled: c.amountCalled,
      callDate: c.callDate,
      dueDate: c.dueDate,
      status: c.status,
      createdAt: c.createdAt,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
