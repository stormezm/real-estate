// report.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileUploadUtil } from 'src/common/utils/file-upload.util';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import * as fsPromises from 'fs/promises';

const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async createReport(dto: CreateReportDto, adminId: number) {
    const userFund = await this.prisma.userFund.findUnique({
      where: { userId_fundId: { userId: dto.userId, fundId: dto.fundId } },
      include: { fund: true },
    });
    if (!userFund) throw new NotFoundException('UserFund not found');
    const htmlTemplate = `
      <h1>${dto.title}</h1>
      <p>Type: ${dto.type}</p>
      <p>Fund: ${userFund.fund.name}</p>
      <hr>
      <p>${dto.body}</p>
    `;

    const pdfFilename = `${userFund.id}-${Date.now()}.pdf`;
    const reportsDir = path.join(process.cwd(), 'uploads', 'reports');
    const pdfPath = path.join(reportsDir, pdfFilename);

    // Ensure reports directory exists
    const dirExists = await exists(reportsDir);
    if (!dirExists) {
      await mkdir(reportsDir, { recursive: true });
    }

    // For now, save HTML content as a simple text file
    // In production, you would use a PDF library like pdfkit or puppeteer
    // This is a placeholder - you can implement proper PDF generation later
    await fsPromises.writeFile(pdfPath.replace('.pdf', '.html'), htmlTemplate);

    const report = await this.prisma.reports.create({
      data: {
        reportDate: new Date(dto.reportDate),
        title: dto.title,
        type: dto.type,
        userFundId: userFund.id,
        fileUrl: `/uploads/reports/${pdfFilename}`,
        body: dto.body,
        createdBy: adminId,
      },
    });

    return { message: 'Report created successfully', data: report };
  }

  async updateReport(id: number, dto: UpdateReportDto, adminId: number) {
    const existing = await this.prisma.reports.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Report not found');

    const updated = await this.prisma.reports.update({
      where: { id },
      data: {
        reportDate: dto.reportDate
          ? new Date(dto.reportDate)
          : existing.reportDate,
        title: dto.title ?? existing.title,
        type: dto.type ?? existing.type,
        body: dto.body ?? existing.body,
        createdBy: adminId,
      },
    });

    return { message: 'Report updated successfully', data: updated };
  }

  async removeReport(id: number) {
    const existing = await this.prisma.reports.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Report not found');

    await FileUploadUtil.deleteFile(existing.fileUrl);

    await this.prisma.reports.delete({ where: { id } });
    return { message: 'Report deleted successfully' };
  }

  async getReportsByUserFund(userFundId: number, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.prisma.reports.findMany({
        where: { userFundId },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          type: true,
          fileUrl: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.reports.count({
        where: { userFundId },
      }),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAllReports(paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      this.prisma.reports.findMany({
        skip,
        take: limit,
        include: {
          userFund: {
            include: {
              fund: {
                select: {
                  id: true,
                  name: true,
                },
              },
              user: {
                select: {
                  id: true,
                  username: true,
                },
              },
            },
          },
          admin: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.reports.count(),
    ]);

    return {
      data: reports,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
