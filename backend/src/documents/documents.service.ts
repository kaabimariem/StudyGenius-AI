import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from '../entities/document.entity';
import { Course } from '../entities/course.entity';
import { User, UserRole } from '../entities/user.entity';
import { CoursesService } from '../courses/courses.service';
import { MulterFile } from '../common/types/multer-file.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DocumentsService {
  private readonly uploadPath = path.join(process.cwd(), 'uploads', 'documents');

  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    @Inject(forwardRef(() => CoursesService))
    private coursesService: CoursesService,
  ) {
    // Créer le dossier uploads s'il n'existe pas
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async create(
    file: MulterFile,
    courseId: number,
    user: User,
  ): Promise<Document> {
    const course = await this.coursesService.findOne(courseId);

    // Vérifier les permissions
    if (course.teacherId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Vous n\'avez pas la permission d\'ajouter des documents à ce cours');
    }

    // Générer un nom de fichier unique
    const uniqueFilename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.originalname}`;
    const filePath = path.join(this.uploadPath, uniqueFilename);

    // Sauvegarder le fichier
    fs.writeFileSync(filePath, file.buffer);

    // Créer l'entrée en base de données
    const document = this.documentsRepository.create({
      filename: uniqueFilename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      path: filePath,
      size: file.size,
      course,
      courseId: course.id,
    });

    return this.documentsRepository.save(document);
  }

  async findAll(courseId?: number): Promise<Document[]> {
    const query = this.documentsRepository.createQueryBuilder('document')
      .leftJoinAndSelect('document.course', 'course');

    if (courseId) {
      query.where('document.courseId = :courseId', { courseId });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Document> {
    const document = await this.documentsRepository.findOne({
      where: { id },
      relations: ['course'],
    });

    if (!document) {
      throw new NotFoundException(`Document avec l'ID ${id} introuvable`);
    }

    return document;
  }

  async remove(id: number, user: User): Promise<void> {
    const document = await this.findOne(id);
    const course = await this.coursesService.findOne(document.courseId);

    // Vérifier les permissions
    if (course.teacherId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Vous n\'avez pas la permission de supprimer ce document');
    }

    // Supprimer le fichier physique
    if (fs.existsSync(document.path)) {
      fs.unlinkSync(document.path);
    }

    // Supprimer l'entrée en base de données
    await this.documentsRepository.remove(document);
  }

  getFilePath(document: Document): string {
    return document.path;
  }
}

