import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './adminDashboard/user/user.module';
import { FundModule } from './adminDashboard/fund/fund.module';
import { CapitalcallModule } from './capitalcall/capitalcall.module';
import { DistributionModule } from './distribution/distribution.module';
import { UserFundModule } from './user-fund/user-fund.module';
import { AdminModule } from './admin/admin.module';
import { ReportModule } from './report/report.module';
import { DashboardModule } from './adminDashboard/dashboard/dashboard.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    FundModule,
    CapitalcallModule,
    DistributionModule,
    UserFundModule,
    AdminModule,
    ReportModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
