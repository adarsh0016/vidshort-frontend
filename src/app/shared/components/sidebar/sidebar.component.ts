import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { StorageBarComponent } from '../storage-bar/storage-bar.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, StorageBarComponent],
  template: `
    <aside class="hidden md:flex flex-col w-64 bg-dark-900 border-r border-dark-800 h-screen sticky top-0 p-4 justify-between z-30">
      <div>
        <!-- Logo -->
        <div class="flex items-center gap-3 px-2 py-4 mb-4">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-700/30">
            <svg class="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 class="font-bold text-lg leading-tight tracking-tight text-white">Veo Studio</h1>
            <p class="text-xs text-brand-500 font-mono">Gemini & R2 Engine</p>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1">
          <a routerLink="/dashboard" routerLinkActive="bg-brand-600/15 text-brand-400 font-semibold border-brand-500"
             class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-300 hover:bg-dark-850 hover:text-white transition-all border border-transparent">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Dashboard
          </a>

          <a routerLink="/gallery" routerLinkActive="bg-brand-600/15 text-brand-400 font-semibold border-brand-500"
             class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-300 hover:bg-dark-850 hover:text-white transition-all border border-transparent">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Gallery & R2 Assets
          </a>

          <a routerLink="/settings" routerLinkActive="bg-brand-600/15 text-brand-400 font-semibold border-brand-500"
             class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-slate-300 hover:bg-dark-850 hover:text-white transition-all border border-transparent">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            API Key & Settings
          </a>
        </nav>
      </div>

      <!-- Storage widget & user profile -->
      <div class="space-y-4">
        <app-storage-bar></app-storage-bar>

        <div class="flex items-center justify-between p-2 rounded-xl bg-dark-850 border border-dark-800">
          <div class="flex items-center gap-2 overflow-hidden">
            <div class="w-8 h-8 rounded-full bg-brand-700/50 flex items-center justify-center font-bold text-xs text-brand-200">
              {{ (authService.currentUser()?.displayName || 'U')[0] }}
            </div>
            <div class="truncate">
              <p class="text-xs font-medium text-white truncate">{{ authService.currentUser()?.displayName }}</p>
              <p class="text-[10px] text-slate-500 truncate">{{ authService.currentUser()?.email }}</p>
            </div>
          </div>
          <button (click)="authService.logout()" title="Logout" class="text-slate-400 hover:text-red-400 p-1 rounded-lg transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  constructor(public authService: AuthService) {}
}
