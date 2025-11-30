import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  hidePassword = signal(true);

  constructor() {// formulaire de login
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],// champ obligatoire et format email valide 
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) { // bloque si invalide 
      this.isLoading.set(true);
      this.errorMessage.set('');

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isLoading.set(false);
          
          // Redirection basée sur le rôle
          if (response.user?.role === 'SUPER_ORGANISATEUR') {
            this.router.navigate(['/clients']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          const message = error.message || 'Erreur de connexion';
          this.errorMessage.set(message);
        }
      });
    } else {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
    }
  }

  getEmailErrorMessage(): string {
    const emailControl = this.loginForm.get('email');
    if (emailControl?.hasError('required')) {
      return 'L\'email est requis';
    }
    if (emailControl?.hasError('email')) {
      return 'Email invalide';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.loginForm.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Le mot de passe est requis';
    }
    return '';
  }
}
