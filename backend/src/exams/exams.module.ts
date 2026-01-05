import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { Exam } from '../entities/exam.entity';
import { Question } from '../entities/question.entity';
import { ExamResult } from '../entities/exam-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Exam, Question, ExamResult])],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService],
})
export class ExamsModule {}


