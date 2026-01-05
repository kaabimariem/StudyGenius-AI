import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ExamsService } from '../../../services/exams.service';
import { Exam, Question, QuestionType } from '../../../models/exam.model';
import { SubmitExamRequest } from '../../../models/exam.model';

@Component({
  selector: 'app-exam-take',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './exam-take.component.html',
  styleUrl: './exam-take.component.css',
})
export class ExamTakeComponent implements OnInit, OnDestroy {
  exam: Exam | null = null;
  examForm: FormGroup;
  QuestionType = QuestionType;
  timeRemaining: number = 0;
  private timer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private examsService: ExamsService,
    private fb: FormBuilder,
  ) {
    this.examForm = this.fb.group({});
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadExam(+id);
    }
  }

  loadExam(id: number): void {
    this.examsService.getById(id).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.initializeForm(exam.questions);
        this.startTimer(exam.duration);
        this.startExam(id);
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'examen:', error);
      },
    });
  }

  startExam(examId: number): void {
    this.examsService.startExam(examId).subscribe({
      next: () => {
        console.log('Examen démarré');
      },
      error: (error) => {
        console.error('Erreur lors du démarrage de l\'examen:', error);
        alert(error.error?.message || 'Erreur lors du démarrage de l\'examen');
      },
    });
  }

  initializeForm(questions: Question[]): void {
    questions.forEach((q) => {
      if (q.type === QuestionType.MULTIPLE_CHOICE) {
        this.examForm.addControl(`question_${q.id}`, this.fb.control(''));
      } else if (q.type === QuestionType.TRUE_FALSE) {
        this.examForm.addControl(`question_${q.id}`, this.fb.control(''));
      } else {
        this.examForm.addControl(`question_${q.id}`, this.fb.control(''));
      }
    });
  }

  startTimer(duration: number): void {
    this.timeRemaining = duration * 60; // Convertir en secondes
    this.timer = setInterval(() => {
      this.timeRemaining--;
      if (this.timeRemaining <= 0) {
        clearInterval(this.timer);
        this.submitExam();
      }
    }, 1000);
  }

  getTimeDisplay(): string {
    const minutes = Math.floor(this.timeRemaining / 60);
    const seconds = this.timeRemaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  submitExam(): void {
    if (!this.exam) return;

    clearInterval(this.timer);

    const answers: Record<number, string | string[]> = {};
    this.exam.questions.forEach((q) => {
      const value = this.examForm.get(`question_${q.id}`)?.value;
      if (value !== null && value !== undefined && value !== '') {
        answers[q.id] = value;
      }
    });

    const submitRequest: SubmitExamRequest = { answers };

    this.examsService.submitExam(this.exam.id, submitRequest).subscribe({
      next: (result) => {
        alert(`Examen soumis ! Score: ${result.score}/${result.totalPoints}`);
        this.router.navigate(['/student']);
      },
      error: (error) => {
        console.error('Erreur lors de la soumission:', error);
        alert(error.error?.message || 'Erreur lors de la soumission');
      },
    });
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}

