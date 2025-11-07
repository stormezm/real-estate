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
import { CapitalcallService } from './capitalcall.service';
import { CreateCapitalCallDto } from './dto/create-capitalcall.dto';
import { UpdateCapitalcallDto } from './dto/update-capitalcall.dto';
import { JwtAdminAuthGuard } from 'src/auth/guard/jwt-admin.guard';
import { JwtUserAuthGuard } from 'src/auth/guard/jwt-user.guard';
import { User } from 'src/common/decorators/user.decorator';
import type { User as UserEntity } from '@prisma/client';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('capital-calls')
export class CapitalcallController {
  constructor(private readonly capitalcallService: CapitalcallService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAdminAuthGuard)
  createCapitalCall(@Body() createCapitalcallDto: CreateCapitalCallDto) {
    return this.capitalcallService.createCapitalCall(createCapitalcallDto);
  }

  @Put(':id')
  @UseGuards(JwtAdminAuthGuard)
  updateCapitalCall(
    @Param('id') id: string,
    @Body() updateCapitalcallDto: UpdateCapitalcallDto,
  ) {
    return this.capitalcallService.updateCapitalCall(
      Number(id),
      updateCapitalcallDto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAdminAuthGuard)
  removeCapitalCall(@Param('id') id: string) {
    return this.capitalcallService.removeCapitalCall(Number(id));
  }

  @Get('my-capital-calls')
  @UseGuards(JwtUserAuthGuard)
  getMyCapitalCalls(
    @User() user: UserEntity,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.capitalcallService.getCapitalCallsByUser(
      user.id,
      paginationDto,
    );
  }

  @Get('user-fund/:userFundId')
  @UseGuards(JwtUserAuthGuard)
  getCapitalCallsByUserFund(
    @Param('userFundId') userFundId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.capitalcallService.getCapitalCallsByUserFund(
      userFundId,
      paginationDto,
    );
  }
  @Get()
  @UseGuards(JwtAdminAuthGuard)
  getAllCapitalCalls(@Query() paginationDto: PaginationDto) {
    return this.capitalcallService.getAllCapitalCalls(paginationDto);
  }
}
