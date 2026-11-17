import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageService } from '@core/services/storage.service';
import { GalleryAsset, StorageStats } from '@core/models/storage.model';
import { StorageBarComponent } from '@shared/components/storage-bar/storage-bar.component';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterModule, StorageBarComponent],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-8 max-w-7xl mx-auto">
      <div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Gallery & R2 Assets</h1>
        <p class="text-sm text-slate-400 mt-1">Browse, stream, and download all videos and reference images in Cloudflare R2</p>
      </div>

      <!-- Storage overview -->
      <app-storage-bar></app-storage-bar>

      <div *ngIf="loading" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div *ngFor="let i of [1,2,3,4]" class="h-44 bg-dark-900 border border-dark-800 rounded-2xl animate-pulse"></div>
      </div>

      <div *ngIf="!loading && assets.length === 0" class="text-center py-16 bg-dark-900 border border-dark-800 rounded-2xl p-8 space-y-2">
        <p class="text-slate-400 text-sm">No assets saved in Cloudflare R2 yet.</p>
        <p class="text-slate-600 text-xs">Generated scenes and uploaded character images will appear here.</p>
      </div>

      <div *ngIf="!loading && assets.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <div *ngFor="let a of assets" class="bg-dark-900 border border-dark-800 rounded-2xl p-3 space-y-2 group hover:border-brand-500/50 transition-all">
          <div class="w-full aspect-video bg-dark-950 rounded-xl overflow-hidden flex items-center justify-center relative">
            <span *ngIf="a.assetCategory === 'VIDEO'" class="text-2xl">🎬</span>
            <span *ngIf="a.assetCategory !== 'VIDEO'" class="text-2xl">🖼️</span>

            <span class="absolute top-2 left-2 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/60 text-brand-300">
              {{ a.assetCategory }}
            </span>
          </div>

          <div class="space-y-1">
            <p class="text-xs font-medium text-white truncate">{{ a.originalFilename || a.r2ObjectKey }}</p>
            <p class="text-[10px] text-slate-500 font-mono">{{ formatBytes(a.fileSizeBytes) }} • {{ a.createdAt | date:'shortDate' }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GalleryComponent implements OnInit {
  assets: GalleryAsset[] = [];
  loading = true;

  constructor(private storageService: StorageService) {}

  ngOnInit(): void {
    this.storageService.getGalleryAssets().subscribe({
      next: res => {
        this.assets = res.data?.content || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  formatBytes(bytes: number): string {
    if (!bytes) return '0 B';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1) + ' MB';
  }
}
