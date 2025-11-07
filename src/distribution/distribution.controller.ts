import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Put,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DistributionService } from './distribution.service';
import { CreateDistributionDto } from './dto/create-distribution.dto';
import { UpdateDistributionDto } from './dto/update-distribution.dto';
import { JwtAdminAuthGuard } from 'src/auth/guard/jwt-admin.guard';
import { JwtUserAuthGuard } from 'src/auth/guard/jwt-user.guard';
import { User } from 'src/common/decorators/user.decorator';
import type { User as UserEntity } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('distributions')
export class DistributionController {
  constructor(private readonly distributionService: DistributionService) {}
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAdminAuthGuard)
  @UseInterceptors(FileInterceptor('statement'))
  createDistribution(
    @Body() createDistributionDto: CreateDistributionDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.distributionService.createDistribution(
      createDistributionDto,
      file,
    );
  }

  @Put(':id')
  @UseGuards(JwtAdminAuthGuard)
  updateDistribution(
    @Param('id') id: string,
    @Body() updateDistributionDto: UpdateDistributionDto,
  ) {
    return this.distributionService.updateDistribution(
      Number(id),
      updateDistributionDto,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAdminAuthGuard)
  removeDistribution(@Param('id') id: string) {
    return this.distributionService.removeDistribution(Number(id));
  }
  @Get('my-distributions')
  @UseGuards(JwtUserAuthGuard)
  getMyDistributions(
    @User() user: UserEntity,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.distributionService.getDistributionsByUser(
      user.id,
      paginationDto,
    );
  }

  @Get('user-fund/:userFundId')
  @UseGuards(JwtUserAuthGuard)
  getDistributionsByUserFund(
    @Param('userFundId') userFundId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.distributionService.getDistributionsByUserFund(
      userFundId,
      paginationDto,
    );
  }
  @Get()
  @UseGuards(JwtAdminAuthGuard)
  getAllDistributions(@Query() paginationDto: PaginationDto) {
    return this.distributionService.getAllDistributions(paginationDto);
  }
}
