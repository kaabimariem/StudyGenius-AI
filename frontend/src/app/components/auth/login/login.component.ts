import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Si déjà connecté, rediriger vers le dashboard approprié
    if (this.authService.isAuthenticated()) {
      const user = this.authService.getCurrentUser();
      if (user) {
        if (user.role === 'student') {
          this.router.navigate(['/student']);
        } else if (user.role === 'teacher') {
          this.router.navigate(['/teacher']);
        } else if (user.role === 'admin') {
          this.router.navigate(['/admin']);
        }
      }
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage = '';
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          // Rediriger selon le rôle
          const user = response.user;
          if (user.role === 'student') {
            this.router.navigate(['/student']);
          } else if (user.role === 'teacher') {
            this.router.navigate(['/teacher']);
          } else if (user.role === 'admin') {
            this.router.navigate(['/admin']);
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Erreur de connexion';
        },
      });
    }
  }
}


