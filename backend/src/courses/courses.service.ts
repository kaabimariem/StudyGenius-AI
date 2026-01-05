import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { QcmGenerated } from '../entities/qcm-generated.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { DocumentsService } from '../documents/documents.service';
import { AiService } from '../ai/ai.service';
import { QcmResponseDto } from '../ai/dto/qcm-response.dto';
import * as fs from 'fs';
import '../common/polyfills/pdf-polyfills';

// Fonction pour charger pdf-parse de manière dynamique
async function loadPdfParse() {
  const pdfParseModule = require('pdf-parse');
  // pdf-parse exporte une classe PDFParse, on doit l'instancier
  const PDFParse = pdfParseModule.PDFParse || pdfParseModule.default?.PDFParse || pdfParseModule.default || pdfParseModule;
  return PDFParse;
}

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(QcmGenerated)
    private qcmGeneratedRepository: Repository<QcmGenerated>,
    @Inject(forwardRef(() => DocumentsService))
    private documentsService: DocumentsService,
    private aiService: AiService,
  ) {}

  async create(createCourseDto: CreateCourseDto, teacher: User): Promise<Course> {
    const course = this.coursesRepository.create({
      ...createCourseDto,
      teacher,
      teacherId: teacher.id,
    });
    return this.coursesRepository.save(course);
  }

  async findAll(user?: User): Promise<Course[]> {
    const query = this.coursesRepository.createQueryBuilder('course')
      .leftJoinAndSelect('course.teacher', 'teacher')
      .leftJoinAndSelect('course.documents', 'documents')
      .where('course.isActive = :isActive', { isActive: true });

    // Les étudiants voient tous les cours actifs
    // Les enseignants voient leurs cours + tous les cours actifs
    // Les admins voient tous les cours
    if (user && user.role === UserRole.TEACHER) {
      query.orWhere('course.teacherId = :teacherId', { teacherId: user.id });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id },
      relations: ['teacher', 'documents'],
    });

    if (!course) {
      throw new NotFoundException(`Cours avec l'ID ${id} introuvable`);
    }

    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto, user: User): Promise<Course> {
    const course = await this.findOne(id);

    // Seul l'enseignant propriétaire ou un admin peut modifier
    if (course.teacherId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Vous n\'avez pas la permission de modifier ce cours');
    }

    Object.assign(course, updateCourseDto);
    return this.coursesRepository.save(course);
  }

  async remove(id: number, user: User): Promise<void> {
    const course = await this.findOne(id);

    // Seul l'enseignant propriétaire ou un admin peut supprimer
    if (course.teacherId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Vous n\'avez pas la permission de supprimer ce cours');
    }

    await this.coursesRepository.remove(course);
  }

  /**
   * Génère un QCM à partir des documents d'un cours et le sauvegarde
   */
  async generateQcmFromCourse(courseId: number, numberOfQuestions: number = 5, user?: User): Promise<QcmResponseDto> {
    const course = await this.findOne(courseId);
    const documents = await this.documentsService.findAll(courseId);

    if (documents.length === 0) {
      throw new NotFoundException('Aucun document trouvé pour ce cours');
    }

    // Extraire le texte de tous les documents (texte et PDF)
    let combinedText = '';
    const textDocuments: string[] = [];
    const unsupportedDocuments: string[] = [];

    for (const doc of documents) {
      try {
        const isPdf = doc.mimeType === 'application/pdf' || doc.originalName.toLowerCase().endsWith('.pdf');
        const isTextFile = 
          doc.mimeType === 'text/plain' ||
          doc.originalName.toLowerCase().endsWith('.txt') ||
          doc.originalName.toLowerCase().endsWith('.md') ||
          doc.originalName.toLowerCase().endsWith('.csv');

        if (isPdf) {
          // Extraire le texte du PDF
          try {
            const fileBuffer = fs.readFileSync(doc.path);
            const PDFParse = await loadPdfParse();
            const pdfParser = new PDFParse({ data: fileBuffer });
            const pdfData = await pdfParser.getText();
            let extractedText = pdfData.text;
            
            // Nettoyer le texte
            const cleanText = extractedText
              .split('')
              .filter(char => {
                const code = char.charCodeAt(0);
                return (code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13;
              })
              .join('')
              .replace(/\s+/g, ' ')
              .trim();

            if (cleanText.length > 50) {
              combinedText += `\n\n--- Document: ${doc.originalName} ---\n\n${cleanText}\n\n`;
              textDocuments.push(doc.originalName);
            } else {
              unsupportedDocuments.push(doc.originalName);
            }
          } catch (pdfError) {
            console.error(`Erreur lors de l'extraction du PDF ${doc.id}:`, pdfError);
            unsupportedDocuments.push(doc.originalName);
          }
        } else if (isTextFile) {
          const fileContent = fs.readFileSync(doc.path, 'utf-8');
          
          // Filtrer les caractères binaires et non imprimables
          const cleanText = fileContent
            .split('')
            .filter(char => {
              const code = char.charCodeAt(0);
              return (code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13;
            })
            .join('')
            .trim();

          if (cleanText.length > 50) {
            combinedText += `\n\n--- Document: ${doc.originalName} ---\n\n${cleanText}\n\n`;
            textDocuments.push(doc.originalName);
          } else {
            unsupportedDocuments.push(doc.originalName);
          }
        } else {
          // Pour les autres formats (DOCX, etc.), on ne peut pas les lire directement
          unsupportedDocuments.push(doc.originalName);
        }
      } catch (error) {
        console.error(`Erreur lors de la lecture du document ${doc.id}:`, error);
        unsupportedDocuments.push(doc.originalName);
      }
    }

    // Vérifier qu'on a du texte valide
    if (combinedText.trim().length === 0) {
      const errorMessage = unsupportedDocuments.length > 0
        ? `Aucun fichier texte ou PDF valide trouvé. Les formats DOCX et autres formats binaires ne sont pas supportés pour la génération automatique de QCM. Veuillez uploader des fichiers .txt, .md, .csv ou .pdf. Fichiers non supportés: ${unsupportedDocuments.join(', ')}`
        : 'Impossible d\'extraire le texte des documents';
      throw new NotFoundException(errorMessage);
    }

    // Générer le QCM avec l'IA
    const qcmResponse = await this.aiService.generateQcmFromDocument({
      documentText: combinedText,
      numberOfQuestions,
    });

    // Sauvegarder le QCM en base de données
    const qcmGenerated = this.qcmGeneratedRepository.create({
      courseId: course.id,
      questions: JSON.stringify(qcmResponse.questions),
      documentSummary: qcmResponse.documentSummary,
      numberOfQuestions,
      createdById: user?.id,
    });
    await this.qcmGeneratedRepository.save(qcmGenerated);

    return qcmResponse;
  }

  /**
   * Récupère tous les QCMs générés pour un cours
   */
  async getQcmsForCourse(courseId: number): Promise<QcmGenerated[]> {
    return this.qcmGeneratedRepository.find({
      where: { courseId },
      relations: ['createdBy'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Récupère un QCM généré par son ID
   */
  async getQcmById(qcmId: number): Promise<QcmGenerated> {
    const qcm = await this.qcmGeneratedRepository.findOne({
      where: { id: qcmId },
      relations: ['course', 'createdBy'],
    });

    if (!qcm) {
      throw new NotFoundException(`QCM avec l'ID ${qcmId} introuvable`);
    }

    return qcm;
  }
}

