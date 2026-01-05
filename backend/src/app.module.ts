import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { DocumentsModule } from './documents/documents.module';
import { ExamsModule } from './exams/exams.module';
import { AiModule } from './ai/ai.module';
import { User } from './entities/user.entity';
import { Course } from './entities/course.entity';
import { Document } from './entities/document.entity';
import { Exam } from './entities/exam.entity';
import { Question } from './entities/question.entity';
import { ExamResult } from './entities/exam-result.entity';
import { QcmGenerated } from './entities/qcm-generated.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'maryouma123',
      database: process.env.DB_DATABASE || 'StudyGenius',
              entities: [User, Course, Document, Exam, Question, ExamResult, QcmGenerated],
      synchronize: true, // Création automatique des tables à partir des entités
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
    DocumentsModule,
    ExamsModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
