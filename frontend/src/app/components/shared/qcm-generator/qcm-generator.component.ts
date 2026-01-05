import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AiService } from '../../../services/ai.service';
import { QcmResponse, QcmQuestion, QcmResult } from '../../../models/qcm.model';

@Component({
  selector: 'app-qcm-generator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './qcm-generator.component.html',
  styleUrl: './qcm-generator.component.css',
})
export class QcmGeneratorComponent implements OnInit {
  selectedFile: File | null = null;
  documentText: string = '';
  qcmResponse: QcmResponse | null = null;
  qcmForm: FormGroup;
  showResults = false;
  qcmResult: QcmResult | null = null;
  loading = false;
  errorMessage = '';
  numberOfQuestions = 5;
  courseTitle: string = '';

  constructor(
    private fb: FormBuilder,
    private aiService: AiService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.qcmForm = this.fb.group({
      answers: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    // Vérifier si des données QCM ont été passées depuis un cours
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state as { qcmData?: QcmResponse; courseTitle?: string } | undefined;
    
    if (state?.qcmData) {
      this.qcmResponse = state.qcmData;
      this.courseTitle = state.courseTitle || '';
      this.initializeQcmForm(state.qcmData.questions);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.loadDocumentText();
    }
  }

  loadDocumentText(): void {
    if (!this.selectedFile) return;

    // Vérifier le type de fichier
    const fileName = this.selectedFile.name.toLowerCase();
    const isPdf = fileName.endsWith('.pdf') || this.selectedFile.type === 'application/pdf';
    const isTextFile = 
      fileName.endsWith('.txt') ||
      fileName.endsWith('.md') ||
      fileName.endsWith('.csv') ||
      this.selectedFile.type === 'text/plain';

    if (!isPdf && !isTextFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier PDF ou texte (.pdf, .txt, .md, .csv). Les fichiers DOCX ne sont pas encore supportés.';
      this.selectedFile = null;
      return;
    }

    // Pour les PDFs, on les enverra directement au backend qui les traitera
    if (isPdf) {
      this.documentText = ''; // Le PDF sera traité côté backend
      this.errorMessage = '';
      return;
    }

    // Pour les fichiers texte, on les lit directement
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      
      // Filtrer les caractères binaires
      const cleanText = text
        .split('')
        .filter(char => {
          const code = char.charCodeAt(0);
          return (code >= 32 && code <= 126) || code === 9 || code === 10 || code === 13;
        })
        .join('')
        .trim();

      if (cleanText.length < 50) {
        this.errorMessage = 'Le fichier ne contient pas assez de texte valide. Veuillez vérifier que c\'est un fichier texte valide.';
        this.selectedFile = null;
        this.documentText = '';
        return;
      }

      this.documentText = cleanText;
      this.errorMessage = '';
    };
    reader.onerror = () => {
      this.errorMessage = 'Erreur lors de la lecture du fichier.';
      this.selectedFile = null;
    };
    reader.readAsText(this.selectedFile);
  }

  generateQcm(): void {
    if (!this.documentText && !this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un document ou entrer du texte';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.showResults = false;
    this.qcmResult = null;

    if (this.selectedFile) {
      // Générer depuis un fichier
      this.aiService.generateQcmFromDocument(this.selectedFile, this.numberOfQuestions).subscribe({
        next: (response) => {
          this.qcmResponse = response;
          this.initializeQcmForm(response.questions);
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de la génération du QCM';
          this.loading = false;
        },
      });
    } else if (this.documentText) {
      // Générer depuis le texte
      this.aiService.generateQcm({ documentText: this.documentText, numberOfQuestions: this.numberOfQuestions }).subscribe({
        next: (response) => {
          this.qcmResponse = response;
          this.initializeQcmForm(response.questions);
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de la génération du QCM';
          this.loading = false;
        },
      });
    }
  }

  initializeQcmForm(questions: QcmQuestion[]): void {
    const answersArray = this.qcmForm.get('answers') as FormArray;
    answersArray.clear();

    questions.forEach((question, index) => {
      answersArray.push(this.fb.group({
        questionIndex: [index],
        selectedAnswer: [''],
      }));
    });
  }

  get answers(): FormArray {
    return this.qcmForm.get('answers') as FormArray;
  }

  submitQcm(): void {
    if (!this.qcmResponse) return;

    const answers = this.answers.value;
    let score = 0;
    const totalQuestions = this.qcmResponse.questions.length;

    const resultAnswers = this.qcmResponse.questions.map((question, index) => {
      const selectedAnswer = answers[index]?.selectedAnswer || '';
      const isCorrect = selectedAnswer === question.correctAnswer;
      if (isCorrect) {
        score++;
      }
      return {
        questionIndex: index,
        selectedAnswer: selectedAnswer,
      };
    });

    this.qcmResult = {
      score,
      totalQuestions,
      answers: resultAnswers,
      questions: this.qcmResponse.questions,
    };

    this.showResults = true;
  }

  resetQcm(): void {
    this.qcmResponse = null;
    this.qcmResult = null;
    this.showResults = false;
    this.documentText = '';
    this.selectedFile = null;
    this.answers.clear();
  }
}

