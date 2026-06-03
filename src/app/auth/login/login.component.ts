import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  hidePassword = true;
  rememberMe = false;

  readonly demoAccounts = [
    { label: 'Admin RH', username: 'admin.rh', password: 'test123', icon: 'admin_panel_settings' },
    { label: 'Encadrant', username: 'encadrant1', password: 'test123', icon: 'supervisor_account' },
    { label: 'Stagiaire', username: 'stagiaire1', password: 'test123', icon: 'school' },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    const savedUsername = localStorage.getItem('rememberedUsername') ?? '';
    this.rememberMe = !!savedUsername;

    this.loginForm = this.fb.group({
      username: [savedUsername, [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  fillDemo(account: { username: string; password: string }): void {
    this.loginForm.patchValue({ username: account.username, password: account.password });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    if (this.rememberMe) {
      localStorage.setItem('rememberedUsername', this.loginForm.value.username);
    } else {
      localStorage.removeItem('rememberedUsername');
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.status === 401
          ? 'Identifiants incorrects. Veuillez réessayer.'
          : 'Erreur de connexion. Veuillez réessayer.';
      }
    });
  }
}