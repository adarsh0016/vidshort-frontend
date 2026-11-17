import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-register',
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
          <h2 class="text-2xl font-bold text-white">Create your Studio Account</h2>
          <p class="text-sm text-slate-400">Bring your own Gemini API key for free video generation</p>
        </div>

        <div *ngIf="errorMessage" class="p-3 bg-red-900/30 border border-red-800 rounded-lg text-xs text-red-300">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">Display Name</label>
            <input type="text" [(ngModel)]="displayName" name="displayName" required
                   class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                   placeholder="Alex Rivera" />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">Email address</label>
            <input type="email" [(ngModel)]="email" name="email" required
                   class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                   placeholder="you@example.com" />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <input type="password" [(ngModel)]="password" name="password" required minlength="6"
                   class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                   placeholder="••••••••" />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">Gemini API Key (optional now)</label>
            <input type="password" [(ngModel)]="geminiApiKey" name="geminiApiKey"
                   class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-brand-500"
                   placeholder="AIzaSy..." />
            <p class="text-[11px] text-slate-500 mt-1">Stored securely encrypted with AES-256 in PostgreSQL.</p>
          </div>

          <button type="submit" [disabled]="loading"
                  class="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center">
            <span *ngIf="!loading">Create Account</span>
            <span *ngIf="loading" class="animate-pulse">Creating account...</span>
          </button>
        </form>

        <p class="text-center text-xs text-slate-500">
          Already have an account?
          <a routerLink="/auth/login" class="text-brand-400 hover:underline font-medium">Sign in</a>
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  displayName = '';
  email = '';
  password = '';
  geminiApiKey = '';
  loading = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password || !this.displayName) return;
    this.loading = true;
    this.errorMessage = '';

    this.authService.register({
      email: this.email,
      password: this.password,
      displayName: this.displayName,
      geminiApiKey: this.geminiApiKey || undefined
    }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: err => {
        this.loading = false;
        if (err.error?.data && typeof err.error.data === 'object') {
          this.errorMessage = Object.values(err.error.data).join(', ');
        } else {
          this.errorMessage = err.error?.message || 'Registration failed. Try again.';
        }
      }
    });
  }
}
