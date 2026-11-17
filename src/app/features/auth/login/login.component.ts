import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen flex items-center justify-center p-4 bg-dark-950">
      <div class="w-full max-w-md p-6 sm:p-8 bg-dark-900 border border-dark-800 rounded-2xl shadow-2xl space-y-6">
        <div class="text-center space-y-2">
          <div class="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-brand-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-700/30">
            <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="text-2xl font-bold text-white">Sign in to Veo Studio</h2>
          <p class="text-sm text-slate-400">Generate Runway-like videos with Gemini API</p>
        </div>

        <div *ngIf="errorMessage" class="p-3 bg-red-900/30 border border-red-800 rounded-lg text-xs text-red-300">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">Email address</label>
            <input type="email" [(ngModel)]="email" name="email" required
                   class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                   placeholder="you@example.com" />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <input type="password" [(ngModel)]="password" name="password" required
                   class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                   placeholder="••••••••" />
          </div>

          <button type="submit" [disabled]="loading"
                  class="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center">
            <span *ngIf="!loading">Sign In</span>
            <span *ngIf="loading" class="animate-pulse">Signing in...</span>
          </button>
        </form>

        <p class="text-center text-xs text-slate-500">
          Don't have an account?
          <a routerLink="/auth/register" class="text-brand-400 hover:underline font-medium">Create one</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.loading = false;
        if (err.error?.data && typeof err.error.data === 'object') {
          this.errorMessage = Object.values(err.error.data).join(', ');
        } else {
          this.errorMessage = err.error?.message || 'Invalid email or password';
        }
      }
    });
  }
}
