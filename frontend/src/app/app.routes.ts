import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { UserRole } from './models/user.model';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./components/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'student',
    canActivate: [authGuard, roleGuard([UserRole.STUDENT])],
    loadComponent: () => import('./components/student/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
  },
  {
    path: 'student/courses',
    canActivate: [authGuard, roleGuard([UserRole.STUDENT])],
    loadComponent: () => import('./components/student/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
  },
  {
    path: 'student/courses/:id',
    canActivate: [authGuard, roleGuard([UserRole.STUDENT])],
    loadComponent: () => import('./components/student/course-detail/course-detail.component').then(m => m.CourseDetailComponent),
  },
  {
    path: 'student/exams',
    canActivate: [authGuard, roleGuard([UserRole.STUDENT])],
    loadComponent: () => import('./components/student/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
  },
  {
    path: 'student/exams/:id',
    canActivate: [authGuard, roleGuard([UserRole.STUDENT])],
    loadComponent: () => import('./components/student/exam-take/exam-take.component').then(m => m.ExamTakeComponent),
  },
  {
    path: 'student/ai-analysis',
    canActivate: [authGuard, roleGuard([UserRole.STUDENT])],
    loadComponent: () => import('./components/shared/ai-analysis/ai-analysis.component').then(m => m.AiAnalysisComponent),
  },
  {
    path: 'student/qcm-generator',
    canActivate: [authGuard, roleGuard([UserRole.STUDENT])],
    loadComponent: () => import('./components/shared/qcm-generator/qcm-generator.component').then(m => m.QcmGeneratorComponent),
  },
  {
    path: 'teacher/qcm-generator',
    canActivate: [authGuard, roleGuard([UserRole.TEACHER])],
    loadComponent: () => import('./components/shared/qcm-generator/qcm-generator.component').then(m => m.QcmGeneratorComponent),
  },
  {
    path: 'teacher',
    canActivate: [authGuard, roleGuard([UserRole.TEACHER])],
    loadComponent: () => import('./components/teacher/teacher-dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent),
  },
  {
    path: 'teacher/courses',
    canActivate: [authGuard, roleGuard([UserRole.TEACHER])],
    loadComponent: () => import('./components/teacher/teacher-dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent),
  },
  {
    path: 'teacher/courses/new',
    canActivate: [authGuard, roleGuard([UserRole.TEACHER])],
    loadComponent: () => import('./components/teacher/course-create/course-create.component').then(m => m.CourseCreateComponent),
  },
  {
    path: 'teacher/courses/:id',
    canActivate: [authGuard, roleGuard([UserRole.TEACHER])],
    loadComponent: () => import('./components/teacher/course-detail/course-detail.component').then(m => m.CourseDetailTeacherComponent),
  },
  {
    path: 'teacher/exams',
    canActivate: [authGuard, roleGuard([UserRole.TEACHER])],
    loadComponent: () => import('./components/teacher/teacher-dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent),
  },
  {
    path: 'teacher/exams/new',
    canActivate: [authGuard, roleGuard([UserRole.TEACHER])],
    loadComponent: () => import('./components/teacher/exam-create/exam-create.component').then(m => m.ExamCreateComponent),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard([UserRole.ADMIN])],
    loadComponent: () => import('./components/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
  },
  {
    path: '**',
    redirectTo: '/login',
  },
];
