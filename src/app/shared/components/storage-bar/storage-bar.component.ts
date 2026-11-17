import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from '@core/services/storage.service';
import { StorageStats } from '@core/models/storage.model';

@Component({
  selector: 'app-storage-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-3 bg-dark-850 border border-dark-800 rounded-xl space-y-2">
      <div class="flex items-center justify-between text-xs">
        <span class="text-slate-400 font-medium flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
          Cloudflare R2
        </span>
        <span class="text-[11px] font-mono font-semibold" [class.text-amber-400]="(stats?.percentageUsed || 0) > 80" [class.text-brand-400]="(stats?.percentageUsed || 0) <= 80">
          {{ stats?.totalMegabytesUsed || 0 }} MB / 10 GB
        </span>
      </div>

      <!-- Progress bar -->
      <div class="w-full bg-dark-800 h-1.5 rounded-full overflow-hidden">
        <div class="bg-gradient-to-r from-brand-600 to-indigo-500 h-full rounded-full transition-all duration-500"
             [style.width.%]="stats?.percentageUsed || 1"></div>
      </div>

      <div class="flex items-center justify-between text-[10px] text-slate-500">
        <span>Free Tier Active</span>
        <span>{{ stats?.totalVideosCount || 0 }} videos</span>
      </div>
    </div>
  `
})
export class StorageBarComponent implements OnInit {
  stats: StorageStats | null = null;

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    this.storageService.getStorageStats().subscribe({
      next: res => this.stats = res.data,
      error: () => {}
    });
  }
}
