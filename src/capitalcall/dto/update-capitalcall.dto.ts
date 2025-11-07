import { PartialType } from '@nestjs/mapped-types';
import { CreateCapitalCallDto } from './create-capitalcall.dto';

export class UpdateCapitalcallDto extends PartialType(CreateCapitalCallDto) {}
