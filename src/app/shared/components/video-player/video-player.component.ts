import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-dark-800 shadow-2xl group">
      <video *ngIf="videoUrl"
             [src]="videoUrl"
             controls
             playsinline
             class="w-full h-full object-contain">
      </video>

      <div *ngIf="!videoUrl" class="w-full h-full flex flex-col items-center justify-center p-6 text-center text-slate-500">
        <svg class="w-12 h-12 mb-3 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-medium text-slate-400">Ready to Generate</p>
        <p class="text-xs text-slate-600 mt-1">Select or generate a scene to preview video stream</p>
      </div>
    </div>
  `
})
export class VideoPlayerComponent {
  @Input() videoUrl: string | null = null;
}
