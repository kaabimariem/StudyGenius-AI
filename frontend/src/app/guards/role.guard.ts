import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const user = authService.getCurrentUser();

    if (!user) {
      router.navigate(['/login']);
      return false;
    }

    if (allowedRoles.includes(user.role)) {
      return true;
    }

    // Rediriger vers le dashboard selon le rôle
    if (user.role === UserRole.STUDENT) {
      router.navigate(['/student']);
    } else if (user.role === UserRole.TEACHER) {
      router.navigate(['/teacher']);
    } else if (user.role === UserRole.ADMIN) {
      router.navigate(['/admin']);
    } else {
      router.navigate(['/login']);
    }

    return false;
  };
};


