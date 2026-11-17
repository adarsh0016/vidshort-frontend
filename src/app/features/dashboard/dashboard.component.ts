import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '@core/services/project.service';
import { Project } from '@core/models/project.model';
import { StorageBarComponent } from '@shared/components/storage-bar/storage-bar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, StorageBarComponent],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-8 max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Projects Dashboard</h1>
          <p class="text-sm text-slate-400 mt-1">Manage, compose and generate your scene-by-scene AI films</p>
        </div>
        <button (click)="openCreateModal = true"
                class="inline-flex items-center justify-center gap-2 px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl text-sm transition-all shadow-lg shadow-brand-600/25 min-h-[44px]">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      <!-- Mobile Storage Widget -->
      <div class="block md:hidden">
        <app-storage-bar></app-storage-bar>
      </div>

      <!-- Projects Grid: 1-col mobile, 2-col tablet, 3-col desktop -->
      <div *ngIf="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div *ngFor="let i of [1,2,3]" class="h-56 bg-dark-900 border border-dark-800 rounded-2xl animate-pulse p-6"></div>
      </div>

      <div *ngIf="!loading && projects.length === 0" class="text-center py-16 bg-dark-900 border border-dark-800 rounded-2xl p-8 space-y-4">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-dark-850 flex items-center justify-center text-slate-600">
          <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
        </div>
        <h3 class="text-lg font-bold text-white">No projects created yet</h3>
        <p class="text-sm text-slate-400 max-w-md mx-auto">Start by creating a project, configuring character reference images, and composing scene-by-scene storyboard prompts.</p>
        <button (click)="openCreateModal = true"
                class="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-colors">
          Create First Project
        </button>
      </div>

      <div *ngIf="!loading && projects.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div *ngFor="let p of projects" class="bg-dark-900 border border-dark-800 hover:border-brand-600/50 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-lg">
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs px-2.5 py-1 rounded-full font-mono font-semibold"
                    [class.bg-emerald-950]="p.status === 'COMPLETED'"
                    [class.text-emerald-400]="p.status === 'COMPLETED'"
                    [class.bg-brand-950]="p.status === 'DRAFT'"
                    [class.text-brand-400]="p.status === 'DRAFT'"
                    [class.bg-amber-950]="p.status === 'GENERATING'"
                    [class.text-amber-400]="p.status === 'GENERATING'">
                {{ p.status }}
              </span>
              <span class="text-xs text-slate-500 font-mono">{{ p.resolution }} • {{ p.aspectRatio }}</span>
            </div>

            <h3 class="text-lg font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1">
              {{ p.title }}
            </h3>

            <p class="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
              {{ p.description || p.masterPrompt || 'No description provided.' }}
            </p>
          </div>

          <!-- Actions -->
          <div class="pt-5 mt-4 border-t border-dark-800 flex items-center justify-between gap-2">
            <a [routerLink]="['/project', p.id, 'generator']"
               class="flex-1 py-2.5 px-3 bg-brand-600/20 hover:bg-brand-600 text-brand-300 hover:text-white rounded-xl text-xs font-semibold text-center transition-all">
              🎬 Studio
            </a>
            <a [routerLink]="['/project', p.id, 'characters']"
               class="py-2.5 px-3 bg-dark-800 hover:bg-dark-700 text-slate-300 rounded-xl text-xs font-medium transition-all" title="Characters">
              👤
            </a>
            <a [routerLink]="['/project', p.id, 'storyboard']"
               class="py-2.5 px-3 bg-dark-800 hover:bg-dark-700 text-slate-300 rounded-xl text-xs font-medium transition-all" title="Storyboard">
              📋
            </a>
          </div>
        </div>
      </div>

      <!-- Create Project Modal -->
      <div *ngIf="openCreateModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="w-full max-w-lg bg-dark-900 border border-dark-800 rounded-2xl p-6 sm:p-8 space-y-5">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-white">Create New Film Project</h3>
            <button (click)="openCreateModal = false" class="text-slate-500 hover:text-white text-lg">✕</button>
          </div>

          <form (ngSubmit)="onCreateProject()" class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Project Title</label>
              <input type="text" [(ngModel)]="newProject.title" name="title" required
                     class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                     placeholder="Cyberpunk Detective 2088" />
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Master Style Prompt (applied to all scenes)</label>
              <textarea [(ngModel)]="newProject.masterPrompt" name="masterPrompt" rows="3"
                        class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                        placeholder="Cinematic neo-noir, 35mm film grain, moody teal and orange grading, volumetric lighting"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Resolution</label>
                <select [(ngModel)]="newProject.resolution" name="resolution"
                        class="w-full bg-dark-850 border border-dark-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500">
                  <option value="720p">720p HD</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="4K">4K Ultra HD</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Aspect Ratio</label>
                <select [(ngModel)]="newProject.aspectRatio" name="aspectRatio"
                        class="w-full bg-dark-850 border border-dark-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500">
                  <option value="16:9">16:9 Landscape</option>
                  <option value="9:16">9:16 Vertical (Reels/TikTok)</option>
                  <option value="1:1">1:1 Square</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end gap-3 pt-3">
              <button type="button" (click)="openCreateModal = false"
                      class="px-4 py-2.5 bg-dark-800 hover:bg-dark-700 text-slate-300 rounded-xl text-sm font-medium">
                Cancel
              </button>
              <button type="submit" [disabled]="creating"
                      class="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all">
                <span *ngIf="!creating">Create Project</span>
                <span *ngIf="creating">Creating...</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  openCreateModal = false;
  creating = false;

  newProject = {
    title: '',
    description: '',
    masterPrompt: '',
    resolution: '1080p',
    aspectRatio: '16:9'
  };

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.projectService.getProjects().subscribe({
      next: res => {
        this.projects = res.data?.content || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onCreateProject(): void {
    if (!this.newProject.title) return;
    this.creating = true;

    this.projectService.createProject(this.newProject).subscribe({
      next: () => {
        this.creating = false;
        this.openCreateModal = false;
        this.newProject = { title: '', description: '', masterPrompt: '', resolution: '1080p', aspectRatio: '16:9' };
        this.loadProjects();
      },
      error: () => this.creating = false
    });
  }
}
