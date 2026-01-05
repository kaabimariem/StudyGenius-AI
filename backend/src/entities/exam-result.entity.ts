import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Exam } from './exam.entity';

@Entity('exam_results')
export class ExamResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.examResults)
  @JoinColumn({ name: 'studentId' })
  student: User;

  @Column()
  studentId: number;

  @ManyToOne(() => Exam, (exam) => exam.results)
  @JoinColumn({ name: 'examId' })
  exam: Exam;

  @Column()
  examId: number;

  @Column('simple-json')
  answers: Record<number, string | string[]>; // questionId -> réponse(s)

  @Column({ type: 'float', default: 0 })
  score: number;

  @Column({ type: 'float', default: 0 })
  totalPoints: number;

  @Column({ default: false })
  isSubmitted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

