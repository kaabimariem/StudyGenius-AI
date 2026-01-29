import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { CoursesService } from '../../../services/courses.service';
import { ExamsService } from '../../../services/exams.service';
import { AuthService } from '../../../services/auth.service';
import { Course } from '../../../models/course.model';
import { Exam } from '../../../models/exam.model';
import { User } from '../../../models/user.model';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './teacher-dashboard.component.html',
  styleUrl: './teacher-dashboard.component.css',
})
export class TeacherDashboardComponent implements OnInit {
  courses: Course[] = [];
  exams: Exam[] = [];
  currentUser: User | null = null;
  activeSection: 'home' | 'courses' | 'exams' = 'home';

  constructor(
    private coursesService: CoursesService,
    private examsService: ExamsService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadCourses();
    this.loadExams();
    this.detectActiveSection();
    
    // Écouter les changements de route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.detectActiveSection();
      });
  }

  detectActiveSection(): void {
    const url = this.router.url;
    if (url.includes('/teacher/exams')) {
      this.activeSection = 'exams';
    } else if (url.includes('/teacher/courses')) {
      this.activeSection = 'courses';
    } else {
      this.activeSection = 'home';
    }
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

