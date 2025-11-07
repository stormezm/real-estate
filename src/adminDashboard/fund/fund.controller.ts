import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Put,
} from '@nestjs/common';
import { FundService } from './fund.service';
import { CreateFundDto } from './dto/create-fund.dto';
import { UpdateFundDto } from './dto/update-fund.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAdminAuthGuard } from 'src/auth/guard/jwt-admin.guard';

@Controller('funds')
@UseGuards(JwtAdminAuthGuard)
export class FundController {
  constructor(private readonly fundService: FundService) {}

  @Post()
  create(@Body() createFundDto: CreateFundDto) {
    return this.fundService.create(createFundDto);
  }

  @Get()
  getAll(@Query() paginationDto: PaginationDto) {
    return this.fundService.getAll(paginationDto);
  }

  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.fundService.getOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateFundDto: UpdateFundDto) {
    return this.fundService.update(Number(id), updateFundDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.fundService.remove(Number(id));
  }
}
