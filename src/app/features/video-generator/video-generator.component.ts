import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '@core/services/project.service';
import { StoryboardService } from '@core/services/storyboard.service';
import { GenerationService } from '@core/services/generation.service';
import { Project } from '@core/models/project.model';
import { Scene, Storyboard } from '@core/models/storyboard.model';
import { Generation } from '@core/models/generation.model';
import { VideoPlayerComponent } from '@shared/components/video-player/video-player.component';

@Component({
  selector: 'app-video-generator',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, VideoPlayerComponent],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-8 max-w-7xl mx-auto">
      <!-- Top Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <a routerLink="/dashboard" class="text-xs text-brand-400 hover:underline">Projects</a>
            <span class="text-xs text-slate-600">/</span>
            <span class="text-xs text-slate-400 font-mono">{{ project?.title }}</span>
          </div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Studio Video Generator</h1>
        </div>

        <div class="flex items-center gap-2">
          <a [routerLink]="['/project', projectId, 'characters']"
             class="px-4 py-2 bg-dark-850 hover:bg-dark-800 text-slate-300 rounded-xl text-xs font-medium border border-dark-800 transition-colors">
            👤 Characters
          </a>
          <a [routerLink]="['/project', projectId, 'storyboard']"
             class="px-4 py-2 bg-dark-850 hover:bg-dark-800 text-slate-300 rounded-xl text-xs font-medium border border-dark-800 transition-colors">
            📋 Storyboard
          </a>
        </div>
      </div>

      <!-- Main Layout: Stacked on mobile, 2-column split pane on desktop (lg:) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

        <!-- Left / Top Column: Controls & Scene Prompts (lg:col-span-7) -->
        <div class="lg:col-span-7 space-y-5">

          <!-- Master Prompt & Resolution Card -->
          <div class="bg-dark-900 border border-dark-800 rounded-2xl p-5 space-y-4 shadow-lg">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-brand-500"></span>
                Master Cinematic Prompt
              </h3>
              <div class="flex items-center gap-2">
                <span class="text-xs px-2.5 py-1 rounded bg-dark-800 text-brand-400 font-mono">{{ project?.resolution }}</span>
                <span class="text-xs px-2.5 py-1 rounded bg-dark-800 text-slate-400 font-mono">{{ project?.aspectRatio }}</span>
              </div>
            </div>

            <textarea [(ngModel)]="masterPrompt" rows="2"
                      (blur)="onUpdateMasterPrompt()"
                      class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
                      placeholder="Global visual aesthetic: 35mm film grain, anamorphic lens, neon teal/orange grading..."></textarea>
          </div>

          <!-- Scene-by-Scene Prompt Stream -->
          <div class="space-y-3">
            <div class="flex items-center justify-between px-1">
              <h3 class="text-sm font-bold text-white">Scene Pipeline</h3>
              <span class="text-xs text-slate-500">{{ storyboard?.scenes?.length || 0 }} scene(s)</span>
            </div>

            <div *ngIf="!storyboard?.scenes || storyboard!.scenes.length === 0" class="p-8 text-center bg-dark-900 border border-dark-800 rounded-2xl space-y-2">
              <p class="text-xs text-slate-400">No scenes in storyboard yet.</p>
              <a [routerLink]="['/project', projectId, 'storyboard']" class="text-xs text-brand-400 hover:underline font-medium">
                Create scenes in Storyboard Builder →
              </a>
            </div>

            <div *ngFor="let s of storyboard?.scenes; let i = index"
                 class="bg-dark-900 border border-dark-800 rounded-2xl p-4 space-y-3 hover:border-dark-700 transition-all">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-mono font-bold text-brand-400 bg-brand-950 px-2 py-0.5 rounded">Scene {{ i + 1 }}</span>
                  <span class="text-xs text-slate-400 font-mono">{{ s.shotType }} • {{ s.durationSeconds }}s</span>
                </div>

                <!-- Generation Status Badge -->
                <div *ngIf="getGenerationForScene(s.id) as gen" class="text-xs">
                  <span *ngIf="gen.status === 'PROCESSING'" class="text-amber-400 animate-pulse font-mono">⚡ Veo Generating...</span>
                  <span *ngIf="gen.status === 'UPLOADING'" class="text-indigo-400 font-mono">☁️ Uploading to R2...</span>
                  <span *ngIf="gen.status === 'COMPLETED'" class="text-emerald-400 font-mono">✓ Ready</span>
                  <span *ngIf="gen.status === 'FAILED'" class="text-red-400 font-mono">✕ Failed</span>
                </div>
              </div>

              <p class="text-xs text-slate-200 font-medium leading-relaxed">{{ s.prompt }}</p>

              <!-- Error details banner if failed -->
              <div *ngIf="getGenerationForScene(s.id)?.errorMessage as errMsg" class="p-2.5 bg-red-950/40 border border-red-900/50 rounded-xl text-[11px] text-red-300 space-y-1">
                <span class="font-bold flex items-center gap-1 text-red-400">⚠️ Generation Failed:</span>
                <p class="leading-relaxed break-words">{{ errMsg }}</p>
              </div>

              <div class="pt-2 flex items-center justify-between border-t border-dark-800/80">
                <span class="text-[11px] text-slate-500">Camera: {{ s.cameraMovement }}</span>

                <div class="flex items-center gap-2">
                  <button *ngIf="getGenerationForScene(s.id)?.videoUrl as vUrl"
                          (click)="selectedVideoUrl = vUrl"
                          class="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-xs text-brand-300 font-medium rounded-lg transition-colors">
                    ▶ Play
                  </button>

                  <button (click)="onGenerateScene(s.id)"
                          [disabled]="isSceneGenerating(s.id)"
                          class="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-medium rounded-lg text-xs transition-all flex items-center gap-1.5">
                    <span *ngIf="!isSceneGenerating(s.id)">Generate Video</span>
                    <span *ngIf="isSceneGenerating(s.id)" class="animate-pulse">Generating...</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right / Sticky Column: Video Stream Player & Preview (lg:col-span-5) -->
        <div class="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
          <div class="bg-dark-900 border border-dark-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xl">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-white flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                R2 Video Preview
              </h3>
              <a *ngIf="selectedVideoUrl" [href]="selectedVideoUrl" download="scene.mp4" target="_blank"
                 class="text-xs text-brand-400 hover:underline">
                Download MP4 ↓
              </a>
            </div>

            <app-video-player [videoUrl]="selectedVideoUrl"></app-video-player>

            <div class="p-3 bg-dark-850 rounded-xl text-[11px] text-slate-400 space-y-1 font-mono">
              <div class="flex justify-between">
                <span>Model Engine:</span>
                <span class="text-slate-200">Google Veo 3 / 3.1</span>
              </div>
              <div class="flex justify-between">
                <span>Storage Target:</span>
                <span class="text-slate-200">Cloudflare R2 (0 Egress)</span>
              </div>
              <div class="flex justify-between">
                <span>Scene Chaining:</span>
                <span class="text-emerald-400">Last-Frame Continuity Active</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class VideoGeneratorComponent implements OnInit, OnDestroy {
  projectId = '';
  project: Project | null = null;
  storyboard: Storyboard | null = null;
  generations: Generation[] = [];
  masterPrompt = '';
  selectedVideoUrl: string | null = null;
  pollInterval: any = null;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private storyboardService: StoryboardService,
    private generationService: GenerationService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    if (this.projectId) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadData(): void {
    this.projectService.getProjectById(this.projectId).subscribe(res => {
      this.project = res.data;
      this.masterPrompt = this.project.masterPrompt || '';
    });

    this.storyboardService.getStoryboard(this.projectId).subscribe(res => {
      this.storyboard = res.data;
    });

    this.pollGenerations();
  }

  pollGenerations(): void {
    this.generationService.getProjectGenerations(this.projectId).subscribe({
      next: res => {
        this.generations = res.data || [];
        if (!this.selectedVideoUrl) {
          const completed = this.generations.find(g => g.status === 'COMPLETED' && g.videoUrl);
          if (completed) this.selectedVideoUrl = completed.videoUrl || null;
        }

        const hasActiveJobs = this.generations.some(g =>
          g.status === 'QUEUED' || g.status === 'PROCESSING' || g.status === 'UPLOADING'
        );

        if (hasActiveJobs) {
          if (!this.pollInterval) {
            this.pollInterval = setInterval(() => this.pollGenerations(), 4000);
          }
        } else {
          this.stopPolling();
        }
      },
      error: () => this.stopPolling()
    });
  }

  stopPolling(): void {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  getGenerationForScene(sceneId: string): Generation | undefined {
    return this.generations.find(g => g.sceneId === sceneId);
  }

  isSceneGenerating(sceneId: string): boolean {
    const gen = this.getGenerationForScene(sceneId);
    return gen?.status === 'QUEUED' || gen?.status === 'PROCESSING' || gen?.status === 'UPLOADING';
  }

  onGenerateScene(sceneId: string): void {
    this.generationService.generateSceneVideo(sceneId).subscribe({
      next: () => {
        if (!this.pollInterval) {
          this.pollInterval = setInterval(() => this.pollGenerations(), 4000);
        }
        this.pollGenerations();
      },
      error: err => alert(err.error?.message || 'Failed to queue generation')
    });
  }

  onUpdateMasterPrompt(): void {
    if (!this.project) return;
    this.projectService.updateProject(this.projectId, {
      ...this.project,
      masterPrompt: this.masterPrompt
    }).subscribe();
  }
}
