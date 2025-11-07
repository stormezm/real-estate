import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const exists = promisify(fs.exists);
const mkdir = promisify(fs.mkdir);

export class FileUploadUtil {
  /**
   * Save uploaded file to a specified folder and return the relative file path
   * @param file Uploaded file from Multer
   * @param id Unique identifier to generate filename
   * @param folder Target folder inside 'uploads'
   * @param allowedMimeTypes Optional: array of allowed MIME types
   * @param maxSize Optional: maximum file size in bytes (default 10MB)
   * @returns relative file path to save in DB
   */
  static async saveFile(
    file: Express.Multer.File,
    id: string,
    folder: string,
    allowedMimeTypes: string[] = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
    maxSize = 10 * 1024 * 1024, // 10MB
  ): Promise<string> {
    if (!file) throw new BadRequestException('File is required');
    if (!file.buffer) throw new BadRequestException('File buffer is missing');

    const uploadDir = path.join(process.cwd(), 'uploads', folder);

    // Create folder if it doesn't exist
    const dirExists = await exists(uploadDir);
    if (!dirExists) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Validate MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`,
      );
    }

    // Validate file size
    if (file.size > maxSize) {
      throw new BadRequestException(
        `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
      );
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFilename = `${id}-${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, uniqueFilename);

    // Save file
    await writeFile(filePath, file.buffer);

    // Return relative path
    return `/uploads/${folder}/${uniqueFilename}`;
  }

  /**
   * Delete file from filesystem
   */
  static async deleteFile(filePath: string): Promise<void> {
    if (filePath && filePath.startsWith('/uploads/')) {
      const fullPath = path.join(process.cwd(), filePath);
      const fileExists = await exists(fullPath);
      if (fileExists) {
        await unlink(fullPath);
      }
    }
  }

  /**
   * Get full file path for serving
   */
  static getFilePath(relativePath: string): string {
    return path.join(process.cwd(), relativePath);
  }
}
