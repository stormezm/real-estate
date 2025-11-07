import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserFundDto } from './dto/create-user-fund.dto';
import { UpdateUserFundDto } from './dto/update-user-fund.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CalculateService } from './calculate.service';

@Injectable()
export class UserFundService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculateService: CalculateService,
  ) {}

  async addFundToUser(userId: number, dto: CreateUserFundDto) {
    const existing = await this.prisma.userFund.findFirst({
      where: {
        userId: userId,
        fundId: dto.fundId,
      },
    });

    const fund = await this.prisma.fund.findUnique({
      where: { id: dto.fundId },
    });
    if (!fund) {
      throw new NotFoundException('Fund not found');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (existing) {
      throw new ConflictException('User is already invested in this fund');
    }
    const userFund = await this.prisma.userFund.create({
      data: {
        userId: userId,
        fundId: dto.fundId,
        investmentDate: new Date(dto.investmentDate),
        commitmentAmount: dto.commitmentAmount,
        status: 'Active',
      },
    });

    return userFund;
  }

  async updateUserFund(id: number, dto: UpdateUserFundDto) {
    const existing = await this.prisma.userFund.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('User fund not found');
    }
    const userFund = await this.prisma.userFund.update({
      where: { id },
      data: {
        investmentDate: new Date(dto.investmentDate ?? new Date()),
        commitmentAmount: dto.commitmentAmount,
      },
    });
    return userFund;
  }

  async removeUserFund(id: number) {
    const userFund = await this.prisma.userFund.findUnique({
      where: { id },
    });
    if (!userFund) {
      throw new NotFoundException('User fund not found');
    }
    await this.prisma.userFund.delete({ where: { id } });
    return { message: 'User fund deleted successfully' };
  }

  async getUserFundsWithMetrics(userId: number, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [userFunds, total] = await Promise.all([
      this.prisma.userFund.findMany({
        where: { userId: userId },
        skip,
        take: limit,
        include: {
          fund: true,
          capitalCalls: true,
          distributions: true,
        },
        orderBy: {
          investmentDate: 'desc',
        },
      }),
      this.prisma.userFund.count({
        where: { userId: userId },
      }),
    ]);

    if (!userFunds || userFunds.length === 0) {
      throw new NotFoundException('No user funds found');
    }

    const results: Array<{
      fundName: string;
      investmentDate: Date;
      commitmentAmount: number;
      capitalCalled: number;
      distributionsPaid: number;
      currentNav: number;
      irr: number;
    }> = [];

    for (const uf of userFunds) {
      // Calculate metrics using the calculate service
      const metrics = this.calculateService.calculateMetrics(uf);

      results.push({
        fundName: uf.fund.name,
        investmentDate: uf.investmentDate,
        commitmentAmount: Number(uf.commitmentAmount),
        capitalCalled: metrics.capitalCalled,
        distributionsPaid: metrics.distributionsPaid,
        currentNav: metrics.currentNav,
        irr: metrics.irr,
      });
    }

    return {
      data: results,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserPortfolioSummary(userId: number) {
    const userFunds = await this.prisma.userFund.findMany({
      where: { userId: userId },
      include: {
        capitalCalls: true,
        distributions: true,
      },
    });

    if (!userFunds || userFunds.length === 0) {
      throw new NotFoundException('No user funds found');
    }

    let totalInvestedCapital = 0; // Sum of actual capital called (money invested)
    let totalCommitment = 0; // Sum of commitment amounts (promised to invest)
    let totalDistributions = 0;
    let totalNav = 0;
    let activeInvestments = 0;
    let irrSum = 0;
    let moicSum = 0;

    for (const uf of userFunds) {
      totalCommitment += Number(uf.commitmentAmount);

      // Calculate metrics using the calculate service
      const metrics = this.calculateService.calculateMetrics(uf);

      totalInvestedCapital += metrics.capitalCalled;
      totalDistributions += metrics.distributionsPaid;
      totalNav += metrics.currentNav;

      // Count active investments
      if (uf.status === 'Active') {
        activeInvestments++;
      }

      // Sum IRR and MOIC for averaging
      irrSum += metrics.irr;
      moicSum += metrics.moic;
    }

    const portfolioIRR = userFunds.length ? irrSum / userFunds.length : 0;
    const portfolioMOIC = userFunds.length ? moicSum / userFunds.length : 0;

    return {
      totalInvestedCapital, // Actual capital called/invested
      totalCommitment, // Total commitment amount (optional, for reference)
      distributionsReceived: totalDistributions,
      portfolioIRR: Math.round(portfolioIRR * 100) / 100,
      portfolioMOIC: Math.round(portfolioMOIC * 100) / 100,
      activeInvestments,
      portfolioValue: totalNav,
    };
  }

  async getPortfolioValueHistory(userId: number) {
    const userFunds = await this.prisma.userFund.findMany({
      where: { userId: userId },
      include: {
        capitalCalls: {
          orderBy: { callDate: 'asc' },
        },
        distributions: {
          orderBy: { distributionDate: 'asc' },
        },
      },
      orderBy: { investmentDate: 'asc' },
    });

    if (!userFunds || userFunds.length === 0) {
      return [];
    }

    // Get all unique dates from investments, capital calls, and distributions
    const allDates = new Set<Date>();

    // Add investment dates
    userFunds.forEach((uf) => {
      allDates.add(new Date(uf.investmentDate));
    });

    // Add capital call dates
    userFunds.forEach((uf) => {
      uf.capitalCalls.forEach((cc) => {
        if (cc.status === 'Paid') {
          allDates.add(new Date(cc.callDate));
        }
      });
    });

    // Add distribution dates
    userFunds.forEach((uf) => {
      uf.distributions.forEach((dist) => {
        allDates.add(new Date(dist.distributionDate));
      });
    });

    // Add current date
    allDates.add(new Date());

    // Sort dates
    const sortedDates = Array.from(allDates).sort(
      (a, b) => a.getTime() - b.getTime(),
    );

    // Calculate portfolio value at each date
    const portfolioHistory: Array<{
      date: string;
      portfolioValue: number;
      capitalCalled: number;
      distributionsReceived: number;
    }> = [];

    for (const date of sortedDates) {
      let portfolioValue = 0;
      let totalCapitalCalled = 0;
      let totalDistributions = 0;

      for (const uf of userFunds) {
        // Only include funds that were invested before or on this date
        if (new Date(uf.investmentDate) > date) continue;

        // Calculate capital called up to this date
        const capitalCalledUpToDate = uf.capitalCalls
          .filter((cc) => cc.status === 'Paid' && new Date(cc.callDate) <= date)
          .reduce((sum, cc) => sum + Number(cc.amountCalled), 0);

        // Calculate distributions up to this date
        const distributionsUpToDate = uf.distributions
          .filter((dist) => new Date(dist.distributionDate) <= date)
          .reduce((sum, dist) => sum + Number(dist.amountPaid), 0);

        // Calculate NAV at this point in time
        const navAtDate =
          Number(uf.commitmentAmount) +
          distributionsUpToDate -
          capitalCalledUpToDate;

        portfolioValue += navAtDate;
        totalCapitalCalled += capitalCalledUpToDate;
        totalDistributions += distributionsUpToDate;
      }

      portfolioHistory.push({
        date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        portfolioValue: Math.round(portfolioValue * 100) / 100, // Round to 2 decimals
        capitalCalled: Math.round(totalCapitalCalled * 100) / 100,
        distributionsReceived: Math.round(totalDistributions * 100) / 100,
      });
    }

    return portfolioHistory;
  }
  async getAllUserFunds(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [userFunds, total] = await Promise.all([
      this.prisma.userFund.findMany({
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          fund: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.userFund.count(),
    ]);

    const data = userFunds.map((uf) => ({
      id: uf.id,
      investmentDate: uf.investmentDate,
      commitmentAmount: uf.commitmentAmount,
      status: uf.status,
      fund: {
        id: uf.fund.id,
        name: uf.fund.name,
      },
      user: {
        id: uf.user.id,
        username: uf.user.username,
      },
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
}
