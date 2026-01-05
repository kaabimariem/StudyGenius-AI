import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AiService } from '../../../services/ai.service';
import { AnalyzeTextResponse } from '../../../models/ai.model';

@Component({
  selector: 'app-ai-analysis',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ai-analysis.component.html',
  styleUrl: './ai-analysis.component.css',
})
export class AiAnalysisComponent {
  analysisForm: FormGroup;
  fileForm: FormGroup;
  result: AnalyzeTextResponse | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private aiService: AiService,
  ) {
    this.analysisForm = this.fb.group({
      text: ['', [Validators.required]],
    });

    this.fileForm = this.fb.group({
      file: [null, [Validators.required]],
    });
  }

  analyzeText(): void {
    if (this.analysisForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.result = null;

      this.aiService.analyzeText(this.analysisForm.value).subscribe({
        next: (response) => {
          this.result = response;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de l\'analyse';
          this.loading = false;
        },
      });
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileForm.patchValue({ file });
    }
  }

  analyzeDocument(): void {
    const file = this.fileForm.get('file')?.value;
    if (file) {
      this.loading = true;
      this.errorMessage = '';
      this.result = null;

      this.aiService.analyzeDocument(file).subscribe({
        next: (response) => {
          this.result = response;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de l\'analyse du document';
          this.loading = false;
        },
      });
    }
  }
}


