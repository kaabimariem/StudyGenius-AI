import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User, UserRole } from '../entities/user.entity';
import { MulterFile } from '../common/types/multer-file.interface';
import * as fs from 'fs';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: MulterFile,
    @Query('courseId') courseId: string,
    @CurrentUser() user: User,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    const courseIdNum = parseInt(courseId, 10);
    if (isNaN(courseIdNum)) {
      throw new BadRequestException('ID de cours invalide');
    }

    return this.documentsService.create(file, courseIdNum, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Query('courseId') courseId?: string) {
    if (courseId) {
      const courseIdNum = parseInt(courseId, 10);
      if (isNaN(courseIdNum)) {
        throw new BadRequestException('ID de cours invalide');
      }
      return this.documentsService.findAll(courseIdNum);
    }
    return this.documentsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const document = await this.documentsService.findOne(+id);
    const filePath = this.documentsService.getFilePath(document);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier introuvable' });
    }

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
    return res.sendFile(filePath);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.TEACHER, UserRole.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.documentsService.remove(+id, user);
  }
}

