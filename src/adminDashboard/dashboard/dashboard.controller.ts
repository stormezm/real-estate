import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAdminAuthGuard } from 'src/auth/guard/jwt-admin.guard';

@Controller('admin/dashboard')
@UseGuards(JwtAdminAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  async getDashboardData() {
    return this.dashboardService.getDashboardData();
  }
}
