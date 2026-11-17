import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-8 max-w-3xl mx-auto">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">API Key & Storage Settings</h1>
        <p class="text-sm text-slate-400 mt-1">Configure your Gemini API key and Cloudflare R2 credentials</p>
      </div>

      <!-- Gemini Key Section -->
      <div class="bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-4 shadow-lg">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-500 flex items-center justify-center text-white font-bold">
            G
          </div>
          <div>
            <h3 class="text-base font-bold text-white">Google Gemini API Key</h3>
            <p class="text-xs text-slate-400">Used to generate videos with Veo 3 and thumbnails with Imagen 3</p>
          </div>
        </div>

        <div class="p-3 bg-brand-950/40 border border-brand-900/50 rounded-xl text-xs text-brand-300">
          🔒 Your key is encrypted with AES-256 before being stored in the PostgreSQL database. It is never exposed to the browser client.
        </div>

        <div class="space-y-3">
          <label class="block text-xs font-medium text-slate-300">Update API Key</label>
          <input type="password" [(ngModel)]="apiKey"
                 class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-brand-500"
                 placeholder="AIzaSy..." />

          <button (click)="onSaveKey()" [disabled]="saving || !apiKey"
                  class="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-all">
            <span *ngIf="!saving">Save API Key</span>
            <span *ngIf="saving">Saving...</span>
          </button>
        </div>
      </div>

      <!-- Cloudflare R2 Info Section -->
      <div class="bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-3 shadow-lg">
        <h3 class="text-base font-bold text-white">Cloudflare R2 Free Tier Details</h3>
        <ul class="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
          <li><strong>Storage:</strong> 10 GB Standard storage per month (100% Free)</li>
          <li><strong>Egress:</strong> $0.00 bandwidth fees (unlimited video streaming)</li>
          <li><strong>Class A operations (Uploads):</strong> 1 million / month</li>
          <li><strong>Class B operations (Reads):</strong> 10 million / month</li>
        </ul>
      </div>
    </div>
  `
})
export class SettingsComponent {
  apiKey = '';
  saving = false;

  constructor(private authService: AuthService) {}

  onSaveKey(): void {
    if (!this.apiKey) return;
    this.saving = true;

    this.authService.saveApiKey(this.apiKey).subscribe({
      next: () => {
        this.saving = false;
        this.apiKey = '';
        alert('Gemini API key encrypted and updated in database successfully!');
      },
      error: () => {
        this.saving = false;
        alert('Failed to update API key');
      }
    });
  }
}
