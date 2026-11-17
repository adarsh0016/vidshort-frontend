import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoryboardService } from '@core/services/storyboard.service';
import { CharacterService } from '@core/services/character.service';
import { GenerationService } from '@core/services/generation.service';
import { Scene, Storyboard, SceneRequest } from '@core/models/storyboard.model';
import { Character } from '@core/models/character.model';

@Component({
  selector: 'app-storyboard-builder',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-8 max-w-7xl mx-auto">
      <div>
        <a [routerLink]="['/project', projectId, 'generator']" class="text-xs text-brand-400 hover:underline flex items-center gap-1 mb-2">
          ← Back to Studio Generator
        </a>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Storyboard Builder</h1>
            <p class="text-sm text-slate-400 mt-1">Structure scene sequence, shot angles, dialogue & audio cues</p>
          </div>
          <button (click)="openAddModal = true"
                  class="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-brand-600/25 min-h-[44px]">
            + Add Scene
          </button>
        </div>
      </div>

      <!-- Total runtime summary -->
      <div class="flex items-center gap-3 p-3 bg-dark-900 border border-dark-800 rounded-xl text-xs text-slate-400">
        <span>🎬 Scenes: <strong class="text-white">{{ storyboard?.scenes?.length || 0 }}</strong></span>
        <span>⏱️ Estimated Runtime: <strong class="text-brand-400">{{ storyboard?.totalDurationSeconds || 0 }}s</strong></span>
      </div>

      <!-- Scenes List -->
      <div *ngIf="loading" class="space-y-4">
        <div *ngFor="let i of [1,2,3]" class="h-32 bg-dark-900 border border-dark-800 rounded-2xl animate-pulse"></div>
      </div>

      <div *ngIf="!loading && (!storyboard?.scenes || storyboard!.scenes.length === 0)"
           class="text-center py-16 bg-dark-900 border border-dark-800 rounded-2xl p-8 space-y-3">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-dark-850 flex items-center justify-center text-3xl">📋</div>
        <h3 class="text-lg font-bold text-white">Storyboard is empty</h3>
        <p class="text-sm text-slate-400 max-w-md mx-auto">Add scenes step-by-step with camera directions, character tags, and prompts.</p>
        <button (click)="openAddModal = true" class="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium">
          Add First Scene
        </button>
      </div>

      <div *ngIf="!loading && storyboard?.scenes && storyboard!.scenes.length > 0" class="space-y-4">
        <div *ngFor="let s of storyboard!.scenes; let i = index"
             class="bg-dark-900 border border-dark-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center hover:border-dark-700 transition-all">

          <!-- Thumbnail or scene index -->
          <div class="w-full md:w-36 h-24 bg-dark-950 rounded-xl overflow-hidden border border-dark-800 flex-shrink-0 flex items-center justify-center relative group">
            <img *ngIf="s.thumbnailUrl" [src]="s.thumbnailUrl" class="w-full h-full object-cover" />
            <div *ngIf="!s.thumbnailUrl" class="text-center text-xs text-slate-600 p-2">
              <span class="block text-xl font-bold font-mono text-slate-500">#{{ i + 1 }}</span>
              No thumb
            </div>
            <button (click)="onGenerateThumbnail(s.id)" title="Generate thumbnail with Imagen"
                    class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[11px] text-white transition-opacity font-medium">
              🎨 AI Thumbnail
            </button>
          </div>

          <!-- Scene Prompt & Metadata -->
          <div class="flex-1 space-y-2">
            <div class="flex flex-wrap items-center gap-2 text-xs">
              <span class="px-2 py-0.5 rounded bg-brand-950 text-brand-400 font-mono font-semibold">Scene {{ i + 1 }}</span>
              <span class="px-2 py-0.5 rounded bg-dark-800 text-slate-300 font-mono">{{ s.shotType }}</span>
              <span class="px-2 py-0.5 rounded bg-dark-800 text-slate-300 font-mono">{{ s.cameraMovement }}</span>
              <span class="px-2 py-0.5 rounded bg-dark-800 text-amber-400 font-mono">{{ s.durationSeconds }}s</span>
            </div>

            <p class="text-sm text-slate-200 font-medium line-clamp-2">{{ s.prompt }}</p>

            <div class="flex flex-wrap gap-3 text-xs text-slate-400">
              <span *ngIf="s.dialogue" class="text-slate-300 italic">"{{ s.dialogue }}"</span>
              <span *ngIf="s.sfx" class="text-slate-400">SFX: {{ s.sfx }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-dark-800">
            <button (click)="onDeleteScene(s.id)" class="px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/40 rounded-lg transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Add Scene Modal -->
      <div *ngIf="openAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="w-full max-w-lg bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-white">Add Scene to Storyboard</h3>
            <button (click)="openAddModal = false" class="text-slate-500 hover:text-white text-lg">✕</button>
          </div>

          <form (ngSubmit)="onCreateScene()" class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Scene Action & Setting *</label>
              <textarea [(ngModel)]="newScene.prompt" name="prompt" rows="3" required
                        class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                        placeholder="Marcus walks under flickering neon signs in the drenched alleyway, clutching an old envelope."></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Shot Type</label>
                <select [(ngModel)]="newScene.shotType" name="shotType"
                        class="w-full bg-dark-850 border border-dark-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500">
                  <option value="CLOSE_UP">Close-Up</option>
                  <option value="MEDIUM">Medium Shot</option>
                  <option value="WIDE">Wide Shot</option>
                  <option value="EXTREME_WIDE">Extreme Wide</option>
                  <option value="POV">Point of View (POV)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Camera Motion</label>
                <select [(ngModel)]="newScene.cameraMovement" name="cameraMovement"
                        class="w-full bg-dark-850 border border-dark-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500">
                  <option value="STATIC">Static</option>
                  <option value="DOLLY">Slow Dolly-In</option>
                  <option value="TRACKING">Tracking Shot</option>
                  <option value="PAN">Pan Left/Right</option>
                  <option value="DRONE">Drone Push-Forward</option>
                  <option value="HANDHELD">Handheld Gritty</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Duration (seconds)</label>
                <select [(ngModel)]="newScene.durationSeconds" name="durationSeconds"
                        class="w-full bg-dark-850 border border-dark-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500">
                  <option [ngValue]="5">5 seconds</option>
                  <option [ngValue]="8">8 seconds (default)</option>
                  <option [ngValue]="15">15 seconds</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Dialogue (optional)</label>
                <input type="text" [(ngModel)]="newScene.dialogue" name="dialogue"
                       class="w-full bg-dark-850 border border-dark-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                       placeholder="I knew you'd come." />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Sound Effects & Ambient Cues</label>
              <input type="text" [(ngModel)]="newScene.sfx" name="sfx"
                     class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                     placeholder="Heavy rain splashing on asphalt, distant police siren" />
            </div>

            <div class="flex justify-end gap-3 pt-3">
              <button type="button" (click)="openAddModal = false"
                      class="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-slate-300 rounded-xl text-sm font-medium">
                Cancel
              </button>
              <button type="submit" [disabled]="saving"
                      class="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all">
                Add Scene
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class StoryboardBuilderComponent implements OnInit {
  projectId = '';
  storyboard: Storyboard | null = null;
  loading = true;
  openAddModal = false;
  saving = false;

  newScene: SceneRequest = {
    prompt: '',
    shotType: 'MEDIUM',
    cameraMovement: 'DOLLY',
    durationSeconds: 8,
    dialogue: '',
    sfx: ''
  };

  constructor(
    private route: ActivatedRoute,
    private storyboardService: StoryboardService,
    private generationService: GenerationService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    if (this.projectId) this.loadStoryboard();
  }

  loadStoryboard(): void {
    this.loading = true;
    this.storyboardService.getStoryboard(this.projectId).subscribe({
      next: res => {
        this.storyboard = res.data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onCreateScene(): void {
    if (!this.newScene.prompt) return;
    this.saving = true;

    this.storyboardService.addScene(this.projectId, this.newScene).subscribe({
      next: () => {
        this.saving = false;
        this.openAddModal = false;
        this.newScene = { prompt: '', shotType: 'MEDIUM', cameraMovement: 'DOLLY', durationSeconds: 8 };
        this.loadStoryboard();
      },
      error: () => this.saving = false
    });
  }

  onDeleteScene(sceneId: string): void {
    if (!confirm('Delete this scene?')) return;
    this.storyboardService.deleteScene(this.projectId, sceneId).subscribe({
      next: () => this.loadStoryboard()
    });
  }

  onGenerateThumbnail(sceneId: string): void {
    this.generationService.generateThumbnail(sceneId).subscribe({
      next: () => {
        alert('Thumbnail generated with Gemini Imagen!');
        this.loadStoryboard();
      }
    });
  }
}
