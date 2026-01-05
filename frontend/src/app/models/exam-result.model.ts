import { User } from './user.model';
import { Exam } from './exam.model';

export interface ExamResult {
  id: number;
  student: User;
  studentId: number;
  exam: Exam;
  examId: number;
  answers: Record<number, string | string[]>;
  score: number;
  totalPoints: number;
  isSubmitted: boolean;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}


