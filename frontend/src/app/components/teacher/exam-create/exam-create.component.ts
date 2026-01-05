import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ExamsService } from '../../../services/exams.service';
import { CreateExamRequest, CreateQuestionRequest, QuestionType } from '../../../models/exam.model';

@Component({
  selector: 'app-exam-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './exam-create.component.html',
  styleUrl: './exam-create.component.css',
})
export class ExamCreateComponent {
  examForm: FormGroup;
  questionsFormArray: FormArray;
  QuestionType = QuestionType;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private examsService: ExamsService,
    private router: Router,
  ) {
    this.examForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      duration: [60, [Validators.required, Validators.min(1)]],
      isActive: [true],
      questions: this.fb.array([]),
    });

    this.questionsFormArray = this.examForm.get('questions') as FormArray;
    this.addQuestion();
  }

  get questions(): FormArray {
    return this.examForm.get('questions') as FormArray;
  }

  addQuestion(): void {
    const questionGroup = this.fb.group({
      text: ['', [Validators.required]],
      type: [QuestionType.MULTIPLE_CHOICE, [Validators.required]],
      options: this.fb.array([this.fb.control(''), this.fb.control('')]),
      correctAnswer: ['', [Validators.required]],
      points: [1, [Validators.required, Validators.min(1)]],
    });

    this.questionsFormArray.push(questionGroup);
  }

  removeQuestion(index: number): void {
    if (this.questionsFormArray.length > 1) {
      this.questionsFormArray.removeAt(index);
    }
  }

  getQuestionOptions(index: number): FormArray {
    return this.questions.at(index).get('options') as FormArray;
  }

  addOption(questionIndex: number): void {
    const options = this.getQuestionOptions(questionIndex);
    options.push(this.fb.control(''));
  }

  removeOption(questionIndex: number, optionIndex: number): void {
    const options = this.getQuestionOptions(questionIndex);
    if (options.length > 2) {
      options.removeAt(optionIndex);
    }
  }

  onQuestionTypeChange(index: number, event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const type = selectElement.value as QuestionType;
    const question = this.questions.at(index);
    const options = question.get('options') as FormArray;
    const correctAnswer = question.get('correctAnswer');

    if (type === QuestionType.TRUE_FALSE) {
      // Vider les options et mettre à jour la réponse correcte
      while (options.length > 0) {
        options.removeAt(0);
      }
      correctAnswer?.setValue('');
    } else if (type === QuestionType.MULTIPLE_CHOICE) {
      // Réinitialiser les options si elles sont vides
      if (options.length === 0) {
        options.push(this.fb.control(''));
        options.push(this.fb.control(''));
      }
    } else if (type === QuestionType.SHORT_ANSWER) {
      // Vider les options
      while (options.length > 0) {
        options.removeAt(0);
      }
      correctAnswer?.setValue('');
    }
  }

  onSubmit(): void {
    if (this.examForm.valid && this.questionsFormArray.length > 0) {
      this.errorMessage = '';
      this.successMessage = '';

      const questions: CreateQuestionRequest[] = this.questionsFormArray.value.map((q: {
        text: string;
        type: QuestionType;
        options?: string[];
        correctAnswer: string | string[];
        points?: number;
      }) => {
        const question: CreateQuestionRequest = {
          text: q.text,
          type: q.type,
          correctAnswer: q.correctAnswer,
          points: q.points || 1,
        };

        if (q.type === QuestionType.MULTIPLE_CHOICE && q.options && q.options.length > 0) {
          question.options = q.options.filter((opt: string) => opt.trim() !== '');
        }

        return question;
      });

      const examData: CreateExamRequest = {
        title: this.examForm.value.title,
        description: this.examForm.value.description,
        startDate: new Date(this.examForm.value.startDate).toISOString(),
        endDate: new Date(this.examForm.value.endDate).toISOString(),
        duration: this.examForm.value.duration,
        questions: questions,
        isActive: this.examForm.value.isActive,
      };

      this.examsService.create(examData).subscribe({
        next: () => {
          this.successMessage = 'Examen créé avec succès !';
          setTimeout(() => {
            this.router.navigate(['/teacher']);
          }, 1500);
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de la création de l\'examen';
        },
      });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs requis et ajouter au moins une question.';
    }
  }
}

