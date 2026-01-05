import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CoursesService } from '../../../services/courses.service';
import { DocumentsService } from '../../../services/documents.service';
import { CreateCourseRequest } from '../../../models/course.model';

@Component({
  selector: 'app-course-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './course-create.component.html',
  styleUrl: './course-create.component.css',
})
export class CourseCreateComponent {
  courseForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  selectedFiles: File[] = [];

  constructor(
    private fb: FormBuilder,
    private coursesService: CoursesService,
    private documentsService: DocumentsService,
    private router: Router,
  ) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      code: ['', [Validators.required, Validators.minLength(3)]],
      isActive: [true],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  onSubmit(): void {
    if (this.courseForm.valid) {
      this.errorMessage = '';
      this.successMessage = '';

      const courseData: CreateCourseRequest = {
        title: this.courseForm.value.title,
        description: this.courseForm.value.description,
        code: this.courseForm.value.code,
        isActive: this.courseForm.value.isActive,
      };

      this.coursesService.create(courseData).subscribe({
        next: (course) => {
          this.successMessage = 'Cours créé avec succès !';
          
          // Upload des documents si des fichiers sont sélectionnés
          if (this.selectedFiles.length > 0) {
            this.uploadDocuments(course.id);
          } else {
            // Rediriger après 1 seconde
            setTimeout(() => {
              this.router.navigate(['/teacher']);
            }, 1000);
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur lors de la création du cours';
        },
      });
    }
  }

  uploadDocuments(courseId: number): void {
    let uploadCount = 0;
    const totalFiles = this.selectedFiles.length;

    this.selectedFiles.forEach((file) => {
      this.documentsService.upload(file, courseId).subscribe({
        next: () => {
          uploadCount++;
          if (uploadCount === totalFiles) {
            this.successMessage = 'Cours et documents créés avec succès !';
            setTimeout(() => {
              this.router.navigate(['/teacher']);
            }, 1500);
          }
        },
        error: (error) => {
          console.error('Erreur lors de l\'upload du document:', error);
          uploadCount++;
          if (uploadCount === totalFiles) {
            this.successMessage = 'Cours créé, mais certains documents n\'ont pas pu être uploadés.';
            setTimeout(() => {
              this.router.navigate(['/teacher']);
            }, 2000);
          }
        },
      });
    });
  }
}


