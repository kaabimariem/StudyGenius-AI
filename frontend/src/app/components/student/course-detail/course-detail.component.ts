import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CoursesService } from '../../../services/courses.service';
import { DocumentsService } from '../../../services/documents.service';
import { Course } from '../../../models/course.model';
import { Document } from '../../../models/document.model';
import { QcmResponse } from '../../../models/qcm.model';
import { QcmGenerated } from '../../../models/qcm-generated.model';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css',
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  documents: Document[] = [];
  qcms: QcmGenerated[] = [];
  generatingQcm = false;
  qcmGenerated: QcmResponse | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coursesService: CoursesService,
    private documentsService: DocumentsService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadCourse(+id);
      this.loadDocuments(+id);
      this.loadQcms(+id);
    }
  }

  loadCourse(id: number): void {
    this.coursesService.getById(id).subscribe({
      next: (course) => {
        this.course = course;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du cours:', error);
      },
    });
  }

  loadDocuments(courseId: number): void {
    this.documentsService.getAll(courseId).subscribe({
      next: (documents) => {
        this.documents = documents;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des documents:', error);
      },
    });
  }

  downloadDocument(doc: Document): void {
    this.documentsService.download(doc.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = doc.originalName;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Erreur lors du téléchargement:', error);
        alert('Erreur lors du téléchargement du document');
      },
    });
  }

  generateQcmFromCourse(): void {
    if (!this.course) return;

    this.generatingQcm = true;
    this.coursesService.generateQcm(this.course.id, 5).subscribe({
      next: (qcmResponse) => {
        this.qcmGenerated = qcmResponse;
        this.generatingQcm = false;
        // Recharger la liste des QCMs
        this.loadQcms(this.course!.id);
        // Rediriger vers le générateur de QCM avec les données
        this.router.navigate(['/student/qcm-generator'], {
          state: { qcmData: qcmResponse, courseTitle: this.course?.title },
        });
      },
      error: (error) => {
        console.error('Erreur lors de la génération du QCM:', error);
        alert(error.error?.message || 'Erreur lors de la génération du QCM');
        this.generatingQcm = false;
      },
    });
  }

  loadQcms(courseId: number): void {
    this.coursesService.getQcmsForCourse(courseId).subscribe({
      next: (qcms) => {
        this.qcms = qcms;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des QCMs:', error);
      },
    });
  }

  takeQcm(qcm: QcmGenerated): void {
    try {
      const questions = JSON.parse(qcm.questions);
      const qcmResponse: QcmResponse = {
        questions,
        documentSummary: qcm.documentSummary,
      };
      this.router.navigate(['/student/qcm-generator'], {
        state: { qcmData: qcmResponse, courseTitle: this.course?.title, qcmId: qcm.id },
      });
    } catch (error) {
      console.error('Erreur lors du parsing du QCM:', error);
      alert('Erreur lors du chargement du QCM');
    }
  }
}

