import { User } from './user.model';
import { ExamResult } from './exam-result.model';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string | string[];
  points: number;
  examId: number;
}

export interface Exam {
  id: number;
  title: string;
  description: string;
  teacher: User;
  teacherId: number;
  questions: Question[];
  results?: ExamResult[];
  startDate: string;
  endDate: string;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  duration?: number;
  questions: CreateQuestionRequest[];
  isActive?: boolean;
}

export interface CreateQuestionRequest {
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | string[];
  points?: number;
}

export interface SubmitExamRequest {
  answers: Record<number, string | string[]>;
}


