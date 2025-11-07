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
  Query,
  Put,
} from '@nestjs/common';
import { UserFundService } from './user-fund.service';
import { CreateUserFundDto } from './dto/create-user-fund.dto';
import { UpdateUserFundDto } from './dto/update-user-fund.dto';
import { JwtUserAuthGuard } from 'src/auth/guard/jwt-user.guard';
import { User } from 'src/common/decorators/user.decorator';
import type { User as UserEntity } from '@prisma/client';
import { JwtAdminAuthGuard } from 'src/auth/guard/jwt-admin.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('user-funds')
export class UserFundController {
  constructor(private readonly userFundService: UserFundService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAdminAuthGuard)
  addFundToUser(@Body() createUserFundDto: CreateUserFundDto) {
    return this.userFundService.addFundToUser(
      createUserFundDto.userId,
      createUserFundDto,
    );
  }

  @Get('my-funds')
  @UseGuards(JwtUserAuthGuard)
  getUserFundsWithMetrics(
    @User() user: UserEntity,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.userFundService.getUserFundsWithMetrics(user.id, paginationDto);
  }

  @Get('portfolio-summary')
  @UseGuards(JwtUserAuthGuard)
  getUserPortfolioSummary(@User() user: UserEntity) {
    return this.userFundService.getUserPortfolioSummary(user.id);
  }

  @Get('portfolio-value-history')
  @UseGuards(JwtUserAuthGuard)
  getPortfolioValueHistory(@User() user: UserEntity) {
    return this.userFundService.getPortfolioValueHistory(user.id);
  }

  @Put(':id')
  @UseGuards(JwtAdminAuthGuard)
  updateUserFund(
    @Param('id') id: string,
    @Body() updateUserFundDto: UpdateUserFundDto,
  ) {
    return this.userFundService.updateUserFund(Number(id), updateUserFundDto);
  }

  @Delete(':id')
  @UseGuards(JwtAdminAuthGuard)
  removeUserFund(@Param('id') id: string) {
    return this.userFundService.removeUserFund(Number(id));
  }
  @Get()
  @UseGuards(JwtAdminAuthGuard)
  getAllUserFunds(@Query() paginationDto: PaginationDto) {
    return this.userFundService.getAllUserFunds(paginationDto);
  }
}
