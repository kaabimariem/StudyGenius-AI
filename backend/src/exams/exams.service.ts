import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exam } from '../entities/exam.entity';
import { Question } from '../entities/question.entity';
import { ExamResult } from '../entities/exam-result.entity';
import { User, UserRole } from '../entities/user.entity';
import { CreateExamDto } from './dto/create-exam.dto';
import { SubmitExamDto } from './dto/submit-exam.dto';

@Injectable()
export class ExamsService {
  constructor(
    @InjectRepository(Exam)
    private examsRepository: Repository<Exam>,
    @InjectRepository(Question)
    private questionsRepository: Repository<Question>,
    @InjectRepository(ExamResult)
    private examResultsRepository: Repository<ExamResult>,
  ) {}

  async create(createExamDto: CreateExamDto, teacher: User): Promise<Exam> {
    const exam = this.examsRepository.create({
      title: createExamDto.title,
      description: createExamDto.description,
      startDate: new Date(createExamDto.startDate),
      endDate: new Date(createExamDto.endDate),
      duration: createExamDto.duration || 60,
      isActive: createExamDto.isActive ?? true,
      teacher,
      teacherId: teacher.id,
    });

    const savedExam = await this.examsRepository.save(exam);

    // Créer les questions
    const questions = createExamDto.questions.map((q) =>
      this.questionsRepository.create({
        ...q,
        exam: savedExam,
        examId: savedExam.id,
      }),
    );

    await this.questionsRepository.save(questions);

    return this.findOne(savedExam.id);
  }

  async findAll(user?: User): Promise<Exam[]> {
    const query = this.examsRepository.createQueryBuilder('exam')
      .leftJoinAndSelect('exam.teacher', 'teacher')
      .leftJoinAndSelect('exam.questions', 'questions')
      .where('exam.isActive = :isActive', { isActive: true });

    if (user && user.role === UserRole.TEACHER) {
      query.orWhere('exam.teacherId = :teacherId', { teacherId: user.id });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Exam> {
    const exam = await this.examsRepository.findOne({
      where: { id },
      relations: ['teacher', 'questions'],
    });

    if (!exam) {
      throw new NotFoundException(`Examen avec l'ID ${id} introuvable`);
    }

    return exam;
  }

  async startExam(examId: number, student: User): Promise<ExamResult> {
    const exam = await this.findOne(examId);

    // Vérifier si l'examen est disponible
    const now = new Date();
    if (now < new Date(exam.startDate) || now > new Date(exam.endDate)) {
      throw new BadRequestException('Cet examen n\'est pas disponible actuellement');
    }

    // Vérifier si l'étudiant a déjà commencé l'examen
    const existingResult = await this.examResultsRepository.findOne({
      where: { examId, studentId: student.id },
    });

    if (existingResult) {
      if (existingResult.isSubmitted) {
        throw new BadRequestException('Vous avez déjà soumis cet examen');
      }
      return existingResult;
    }

    // Créer un nouveau résultat d'examen
    const result = this.examResultsRepository.create({
      exam,
      examId: exam.id,
      student,
      studentId: student.id,
      answers: {},
      score: 0,
      totalPoints: exam.questions.reduce((sum, q) => sum + q.points, 0),
      isSubmitted: false,
    });

    return this.examResultsRepository.save(result);
  }

  async submitExam(examId: number, submitExamDto: SubmitExamDto, student: User): Promise<ExamResult> {
    const exam = await this.findOne(examId);
    const result = await this.examResultsRepository.findOne({
      where: { examId, studentId: student.id },
      relations: ['exam', 'exam.questions'],
    });

    if (!result) {
      throw new NotFoundException('Vous devez d\'abord commencer l\'examen');
    }

    if (result.isSubmitted) {
      throw new BadRequestException('Cet examen a déjà été soumis');
    }

    // Calculer le score
    let score = 0;
    exam.questions.forEach((question) => {
      const studentAnswer = submitExamDto.answers[question.id];
      if (!studentAnswer) return;

      if (question.type === 'multiple_choice' || question.type === 'true_false') {
        if (Array.isArray(question.correctAnswer)) {
          const correct = question.correctAnswer.sort().join(',');
          const student = Array.isArray(studentAnswer) ? studentAnswer.sort().join(',') : studentAnswer;
          if (correct === student) {
            score += question.points;
          }
        } else {
          if (question.correctAnswer === studentAnswer) {
            score += question.points;
          }
        }
      } else if (question.type === 'short_answer') {
        // Pour les réponses courtes, on accepte une correspondance partielle (à améliorer avec IA)
        const correct = String(question.correctAnswer).toLowerCase().trim();
        const student = String(studentAnswer).toLowerCase().trim();
        if (correct === student || correct.includes(student) || student.includes(correct)) {
          score += question.points;
        }
      }
    });

    result.answers = submitExamDto.answers;
    result.score = score;
    result.isSubmitted = true;
    result.submittedAt = new Date();

    return this.examResultsRepository.save(result);
  }

  async getResults(examId: number, user: User): Promise<ExamResult[]> {
    const exam = await this.findOne(examId);

    // Seul l'enseignant propriétaire ou un admin peut voir les résultats
    if (exam.teacherId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Vous n\'avez pas la permission de voir ces résultats');
    }

    return this.examResultsRepository.find({
      where: { examId },
      relations: ['student', 'exam'],
    });
  }

  async getStudentResult(examId: number, student: User): Promise<ExamResult> {
    const result = await this.examResultsRepository.findOne({
      where: { examId, studentId: student.id },
      relations: ['exam', 'exam.questions'],
    });

    if (!result) {
      throw new NotFoundException('Résultat introuvable');
    }

    return result;
  }

  async remove(id: number, user: User): Promise<void> {
    const exam = await this.findOne(id);

    if (exam.teacherId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Vous n\'avez pas la permission de supprimer cet examen');
    }

    await this.examsRepository.remove(exam);
  }
}


