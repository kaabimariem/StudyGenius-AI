import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CoursesService } from '../../../services/courses.service';
import { ExamsService } from '../../../services/exams.service';
import { User } from '../../../models/user.model';
import { Course } from '../../../models/course.model';
import { Exam } from '../../../models/exam.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  courses: Course[] = [];
  exams: Exam[] = [];

  constructor(
    private authService: AuthService,
    private coursesService: CoursesService,
    private examsService: ExamsService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadCourses();
    this.loadExams();
  }

  loadCourses(): void {
    this.coursesService.getAll().subscribe({
      next: (courses) => {
        this.courses = courses;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cours:', error);
      },
    });
  }

  loadExams(): void {
    this.examsService.getAll().subscribe({
      next: (exams) => {
        this.exams = exams;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des examens:', error);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}

