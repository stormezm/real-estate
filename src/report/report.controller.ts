// reports.controller.ts
import {
  Controller,
  Post,
  Body,
  Delete,
  Param,
  Get,
  UseGuards,
  Put,
  Query,
} from '@nestjs/common';
import { ReportsService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAdminAuthGuard } from 'src/auth/guard/jwt-admin.guard';
import { JwtUserAuthGuard } from 'src/auth/guard/jwt-user.guard';
import { User } from 'src/common/decorators/user.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  @UseGuards(JwtAdminAuthGuard)
  createReport(@Body() dto: CreateReportDto, @User() adminId: number) {
    return this.reportsService.createReport(dto, adminId);
  }

  @Put(':id')
  @UseGuards(JwtAdminAuthGuard)
  updateReport(
    @Param('id') id: string,
    @Body() dto: UpdateReportDto,
    @User() adminId: number,
  ) {
    return this.reportsService.updateReport(Number(id), dto, adminId);
  }

  @Delete(':id')
  @UseGuards(JwtAdminAuthGuard)
  removeReport(@Param('id') id: string) {
    return this.reportsService.removeReport(Number(id));
  }

  @Get('user-fund/:userFundId')
  @UseGuards(JwtUserAuthGuard)
  getReportsByUserFund(
    @Param('userFundId') userFundId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.reportsService.getReportsByUserFund(
      Number(userFundId),
      paginationDto,
    );
  }

  @Get()
  @UseGuards(JwtAdminAuthGuard)
  getAllReports(@Query() paginationDto: PaginationDto) {
    return this.reportsService.getAllReports(paginationDto);
  }
}
