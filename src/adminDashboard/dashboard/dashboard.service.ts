import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData() {
    const [
      totalUsers,
      totalFunds,
      totalDistributions,
      totalReports,
      totalInvested,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.fund.count(),
      this.prisma.distribution.count(),
      this.prisma.reports.count(),
      this.calculateTotalInvested(),
    ]);

    // Monthly distributions (for chart)
    const monthlyDistributions = await this.getMonthlyDistributions();

    return {
      summary: {
        totalUsers,
        totalFunds,
        totalDistributions,
        totalReports,
        totalInvested,
      },
      charts: {
        monthlyDistributions,
      },
    };
  }

  private async calculateTotalInvested(): Promise<number> {
    // Calculate total invested as sum of actual capital called (paid capital calls)
    // This is more accurate than summing commitments
    const capitalCalls = await this.prisma.capitalCall.findMany({
      where: {
        status: 'Paid',
      },
      select: {
        amountCalled: true,
      },
    });
    return capitalCalls.reduce(
      (sum, cc) => sum + Number(cc.amountCalled || 0),
      0,
    );
  }

  private async getMonthlyDistributions(): Promise<
    Array<{ month: string; amount: number }>
  > {
    const now = new Date();
    const months: Array<{ month: string; amount: number }> = [];

    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const distributions = await this.prisma.distribution.aggregate({
        _sum: { amountPaid: true },
        where: {
          distributionDate: {
            gte: start,
            lte: end,
          },
        },
      });

      months.unshift({
        month: start.toLocaleString('default', { month: 'short' }),
        amount: Number(distributions._sum.amountPaid || 0),
      });
    }

    return months;
  }
}
