import { Injectable } from '@nestjs/common';

interface UserFundWithRelations {
  commitmentAmount: number | string;
  capitalCalls: Array<{
    amountCalled: number | string;
    status: string;
  }>;
  distributions: Array<{
    amountPaid: number | string;
  }>;
}

export interface CalculatedMetrics {
  capitalCalled: number;
  distributionsPaid: number;
  currentNav: number;
  moic: number;
  irr: number;
}

@Injectable()
export class CalculateService {
  /**
   * Calculate all performance metrics for a user fund
   * @param userFund User fund with capital calls and distributions
   * @returns Calculated metrics (capitalCalled, distributionsPaid, nav, moic, irr)
   */
  calculateMetrics(userFund: UserFundWithRelations): CalculatedMetrics {
    // Calculate capital called (only paid capital calls)
    const capitalCalled = userFund.capitalCalls
      .filter((cc) => cc.status === 'Paid')
      .reduce((sum, cc) => sum + Number(cc.amountCalled || 0), 0);

    // Calculate total distributions received
    const distributionsPaid = userFund.distributions.reduce(
      (sum, dist) => sum + Number(dist.amountPaid || 0),
      0,
      
    );

    // Calculate NAV (Net Asset Value)
    // NAV = Commitment Amount + Distributions - Capital Called
    // This represents the current value of the investment
    const commitmentAmount = Number(userFund.commitmentAmount || 0);
    const currentNav = commitmentAmount + distributionsPaid - capitalCalled;

    // Calculate MOIC (Multiple on Invested Capital)
    // MOIC = (Distributions + Current NAV) / Capital Called
    // Represents how many times the investment has returned
    const moic =
      capitalCalled === 0
        ? 0
        : (distributionsPaid + currentNav) / capitalCalled;

    // Calculate IRR (Internal Rate of Return)
    // Simplified calculation: ((Distributions + NAV - Capital Called) / Capital Called) * 100
    // Note: True IRR requires time-weighted cash flows and iterative calculation
    // This is a simplified percentage return calculation
    const irr =
      capitalCalled === 0
        ? 0
        : ((distributionsPaid + currentNav - capitalCalled) / capitalCalled) *
          100;

    return {
      capitalCalled: Math.round(capitalCalled * 100) / 100,
      distributionsPaid: Math.round(distributionsPaid * 100) / 100,
      currentNav: Math.round(currentNav * 100) / 100,
      moic: Math.round(moic * 100) / 100,
      irr: Math.round(irr * 100) / 100,
    };
  }

  /**
   * Calculate metrics for multiple user funds
   * @param userFunds Array of user funds with relations
   * @returns Array of calculated metrics
   */
  calculateMetricsForMultiple(
    userFunds: UserFundWithRelations[],
  ): CalculatedMetrics[] {
    return userFunds.map((uf) => this.calculateMetrics(uf));
  }
}
