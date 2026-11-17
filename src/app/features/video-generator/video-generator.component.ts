import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectService } from '@core/services/project.service';
import { StoryboardService } from '@core/services/storyboard.service';
import { GenerationService } from '@core/services/generation.service';
import { CharacterService } from '@core/services/character.service';
import { StorageService } from '@core/services/storage.service';
import { Project } from '@core/models/project.model';
import { Scene, Storyboard, SceneRequest } from '@core/models/storyboard.model';
import { Generation } from '@core/models/generation.model';
import { Character, CharacterRequest } from '@core/models/character.model';
import { VideoPlayerComponent } from '@shared/components/video-player/video-player.component';

@Component({
  selector: 'app-video-generator',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, VideoPlayerComponent],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-8 max-w-7xl mx-auto">
      <!-- Top Bar: Aligned Breadcrumb & Title with Segmented Tabs on Side -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <!-- Clean Inline Breadcrumb -->
          <div class="flex items-center gap-1.5 text-xs text-slate-400 mb-1 leading-none">
            <a routerLink="/dashboard" class="text-brand-400 hover:underline">Projects</a>
            <span class="text-slate-600">/</span>
            <span class="text-slate-300 font-mono truncate max-w-xs">{{ project?.title || 'Loading...' }}</span>
          </div>

          <!-- Studio Title & View Switcher Tabs -->
          <div class="flex flex-wrap items-center gap-3 sm:gap-4">
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Studio Video Generator</h1>

            <!-- Segmented Mode Switcher Tabs right on the side -->
            <div class="inline-flex items-center bg-dark-900 border border-dark-800 rounded-xl p-1 gap-1 shadow-inner">
              <button type="button"
                      (click)="setTab('generator')"
                      [class]="activeTab === 'generator' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-dark-850'"
                      class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                <span>🎬</span> Video Generator
              </button>
              <button type="button"
                      (click)="setTab('storyboard')"
                      [class]="activeTab === 'storyboard' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-dark-850'"
                      class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                <span>📋</span> Storyboard <span class="text-[10px] opacity-80 font-mono">({{ storyboard?.scenes?.length || 0 }})</span>
              </button>
              <button type="button"
                      (click)="setTab('characters')"
                      [class]="activeTab === 'characters' ? 'bg-brand-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-dark-850'"
                      class="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
                <span>👤</span> Characters <span class="text-[10px] opacity-80 font-mono">({{ characters.length }})</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Dynamic Header Action based on active tab -->
        <div class="flex items-center gap-2">
          <button *ngIf="activeTab === 'storyboard'"
                  (click)="openAddSceneModal = true"
                  class="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-brand-600/25 flex items-center gap-1.5">
            <span>+</span> Add Scene
          </button>
          <button *ngIf="activeTab === 'characters'"
                  (click)="openAddCharModal = true"
                  class="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-medium transition-all shadow-lg shadow-brand-600/25 flex items-center gap-1.5">
            <span>+</span> Add Character
          </button>
        </div>
      </div>

      <!-- Quick Slide Animated Carousel Container -->
      <div class="w-full overflow-hidden">
        <div class="flex w-[300%] transition-transform duration-300 ease-out"
             [style.transform]="getSliderTransform()">

          <!-- ================= PANE 1: VIDEO GENERATOR ================= -->
          <div class="w-1/3 flex-shrink-0 pr-3">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              <!-- Left Column: Controls & Scene Pipeline (lg:col-span-7) -->
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
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-slate-500">{{ storyboard?.scenes?.length || 0 }} scene(s)</span>
                      <button (click)="setTab('storyboard')" class="text-xs text-brand-400 hover:underline">Edit in Storyboard →</button>
                    </div>
                  </div>

                  <div *ngIf="!storyboard?.scenes || storyboard!.scenes.length === 0" class="p-8 text-center bg-dark-900 border border-dark-800 rounded-2xl space-y-2">
                    <p class="text-xs text-slate-400">No scenes in storyboard yet.</p>
                    <button (click)="setTab('storyboard')" class="text-xs text-brand-400 hover:underline font-medium">
                      Create scenes in Storyboard Builder →
                    </button>
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
                        <span *ngIf="gen.status === 'PROCESSING'" class="text-amber-400 animate-pulse font-mono">⚡ Synthesizing Video...</span>
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
                                class="px-3 py-1.5 bg-dark-800 hover:bg-dark-700 text-xs text-brand-300 font-medium rounded-lg transition-colors cursor-pointer">
                          ▶ Play
                        </button>

                        <button (click)="onGenerateScene(s.id)"
                                [disabled]="isSceneGenerating(s.id)"
                                class="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-medium rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer">
                          <span *ngIf="!isSceneGenerating(s.id)">Generate Video</span>
                          <span *ngIf="isSceneGenerating(s.id)" class="animate-pulse">Generating...</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column: Video Stream Player & Preview (lg:col-span-5) -->
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
                      <span class="text-slate-200">Gemini Motion Engine</span>
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

          <!-- ================= PANE 2: STORYBOARD BUILDER ================= -->
          <div class="w-1/3 flex-shrink-0 px-2">
            <div class="space-y-5">
              <!-- Summary bar -->
              <div class="flex items-center justify-between p-3.5 bg-dark-900 border border-dark-800 rounded-xl text-xs text-slate-400">
                <div class="flex items-center gap-4">
                  <span>🎬 Total Scenes: <strong class="text-white">{{ storyboard?.scenes?.length || 0 }}</strong></span>
                  <span>⏱️ Estimated Runtime: <strong class="text-brand-400">{{ storyboard?.totalDurationSeconds || 0 }}s</strong></span>
                </div>
                <button (click)="openAddSceneModal = true"
                        class="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium transition-all cursor-pointer">
                  + Add Scene
                </button>
              </div>

              <!-- Scenes Empty State -->
              <div *ngIf="!storyboard?.scenes || storyboard!.scenes.length === 0"
                   class="text-center py-16 bg-dark-900 border border-dark-800 rounded-2xl p-8 space-y-3">
                <div class="w-14 h-14 mx-auto rounded-2xl bg-dark-850 flex items-center justify-center text-2xl">📋</div>
                <h3 class="text-lg font-bold text-white">Storyboard is empty</h3>
                <p class="text-xs text-slate-400 max-w-md mx-auto">Add scenes step-by-step with camera directions, shot angles, and prompts.</p>
                <button (click)="openAddSceneModal = true" class="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-medium cursor-pointer">
                  Add First Scene
                </button>
              </div>

              <!-- Scenes List -->
              <div *ngIf="storyboard?.scenes && storyboard!.scenes.length > 0" class="space-y-4">
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
                            class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[11px] text-white transition-opacity font-medium cursor-pointer">
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
                    <button (click)="onGenerateScene(s.id); setTab('generator')"
                            class="px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 text-brand-400 rounded-lg transition-colors cursor-pointer">
                      Generate 🎬
                    </button>
                    <button (click)="onDeleteScene(s.id)" class="px-3 py-1.5 text-xs text-red-400 hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ================= PANE 3: CHARACTER STUDIO ================= -->
          <div class="w-1/3 flex-shrink-0 pl-3">
            <div class="space-y-5">
              <!-- Summary & Add Character -->
              <div class="flex items-center justify-between p-3.5 bg-dark-900 border border-dark-800 rounded-xl text-xs text-slate-400">
                <span>👤 Consistent Cast: <strong class="text-white">{{ characters.length }}</strong> character(s)</span>
                <button (click)="openAddCharModal = true"
                        class="px-3.5 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-medium transition-all cursor-pointer">
                  + Add Character
                </button>
              </div>

              <!-- Character Empty State -->
              <div *ngIf="characters.length === 0" class="text-center py-16 bg-dark-900 border border-dark-800 rounded-2xl p-8 space-y-3">
                <div class="w-14 h-14 mx-auto rounded-2xl bg-dark-850 flex items-center justify-center text-2xl">👤</div>
                <h3 class="text-lg font-bold text-white">No characters in project</h3>
                <p class="text-xs text-slate-400 max-w-md mx-auto">Add characters with appearance details and reference images to ensure consistent faces and clothing across all scenes.</p>
                <button (click)="openAddCharModal = true" class="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-medium cursor-pointer">
                  Add First Character
                </button>
              </div>

              <!-- Character Grid -->
              <div *ngIf="characters.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div *ngFor="let c of characters" class="bg-dark-900 border border-dark-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between hover:border-dark-700 transition-all">
                  <div class="space-y-3">
                    <!-- Avatar / Reference Image -->
                    <div class="w-full h-40 bg-dark-950 rounded-xl overflow-hidden border border-dark-800 flex items-center justify-center relative group">
                      <img *ngIf="c.primaryImageUrl" [src]="c.primaryImageUrl" class="w-full h-full object-cover" />
                      <div *ngIf="!c.primaryImageUrl" class="text-3xl text-slate-700">👤</div>

                      <!-- Upload Overlay -->
                      <label class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-xs text-white">
                        <span>Upload Reference</span>
                        <input type="file" (change)="onUploadReferenceImage(c.id, $event)" accept="image/*" class="hidden" />
                      </label>
                    </div>

                    <div>
                      <h3 class="text-base font-bold text-white">{{ c.name }}</h3>
                      <p *ngIf="c.ageRange || c.gender" class="text-xs text-brand-400 font-mono">{{ c.ageRange }} • {{ c.gender }}</p>
                    </div>

                    <div class="space-y-1.5 text-xs text-slate-400">
                      <p *ngIf="c.appearance"><strong class="text-slate-300">Look:</strong> {{ c.appearance }}</p>
                      <p *ngIf="c.clothing"><strong class="text-slate-300">Outfit:</strong> {{ c.clothing }}</p>
                      <p *ngIf="c.personality"><strong class="text-slate-300">Traits:</strong> {{ c.personality }}</p>
                    </div>
                  </div>

                  <div class="pt-3 border-t border-dark-800 flex items-center justify-between">
                    <span class="text-[11px] text-slate-500">{{ c.images.length }} reference image(s)</span>
                    <button (click)="onDeleteCharacter(c.id)" class="text-xs text-red-400 hover:text-red-300 transition-colors cursor-pointer">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- ================= MODAL: ADD SCENE ================= -->
      <div *ngIf="openAddSceneModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="w-full max-w-lg bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-white">Add Scene to Storyboard</h3>
            <button (click)="openAddSceneModal = false" class="text-slate-500 hover:text-white text-lg cursor-pointer">✕</button>
          </div>

          <form (ngSubmit)="onCreateScene()" class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Scene Action & Setting *</label>
              <textarea [(ngModel)]="newScene.prompt" name="prompt" rows="3" required
                        class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                        placeholder="Marcus walks under flickering neon signs in the drenched alleyway, clutching an old envelope."></textarea>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Shot Type</label>
                <select [(ngModel)]="newScene.shotType" name="shotType"
                        class="w-full bg-dark-850 border border-dark-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500">
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
                        class="w-full bg-dark-850 border border-dark-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500">
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
                        class="w-full bg-dark-850 border border-dark-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500">
                  <option [ngValue]="5">5 seconds</option>
                  <option [ngValue]="8">8 seconds (default)</option>
                  <option [ngValue]="15">15 seconds</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Dialogue (optional)</label>
                <input type="text" [(ngModel)]="newScene.dialogue" name="dialogue"
                       class="w-full bg-dark-850 border border-dark-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                       placeholder="I knew you'd come." />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Sound Effects & Ambient Cues</label>
              <input type="text" [(ngModel)]="newScene.sfx" name="sfx"
                     class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                     placeholder="Heavy rain splashing on asphalt, distant police siren" />
            </div>

            <div class="flex justify-end gap-3 pt-3">
              <button type="button" (click)="openAddSceneModal = false"
                      class="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer">
                Cancel
              </button>
              <button type="submit" [disabled]="savingScene"
                      class="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-medium transition-all cursor-pointer">
                Add Scene
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ================= MODAL: ADD CHARACTER ================= -->
      <div *ngIf="openAddCharModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="w-full max-w-lg bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold text-white">Add Character</h3>
            <button (click)="openAddCharModal = false" class="text-slate-500 hover:text-white text-lg cursor-pointer">✕</button>
          </div>

          <form (ngSubmit)="onCreateCharacter()" class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Character Name *</label>
              <input type="text" [(ngModel)]="newChar.name" name="name" required
                     class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                     placeholder="Detective Marcus Cole" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Age Range</label>
                <input type="text" [(ngModel)]="newChar.ageRange" name="ageRange"
                       class="w-full bg-dark-850 border border-dark-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                       placeholder="Mid-40s" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Gender</label>
                <input type="text" [(ngModel)]="newChar.gender" name="gender"
                       class="w-full bg-dark-850 border border-dark-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                       placeholder="Male" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Appearance (Hair, face, build)</label>
              <textarea [(ngModel)]="newChar.appearance" name="appearance" rows="2"
                        class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                        placeholder="Weathered face, short salt-and-pepper hair, scar over left eyebrow"></textarea>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Signature Outfit</label>
              <textarea [(ngModel)]="newChar.clothing" name="clothing" rows="2"
                        class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                        placeholder="Dark grey trenchcoat with popped collar, loosened burgundy tie"></textarea>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Personality / Vibe</label>
              <input type="text" [(ngModel)]="newChar.personality" name="personality"
                     class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                     placeholder="Stoic, cynical, weary detective" />
            </div>

            <div class="flex justify-end gap-3 pt-3">
              <button type="button" (click)="openAddCharModal = false"
                      class="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer">
                Cancel
              </button>
              <button type="submit" [disabled]="savingChar"
                      class="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-medium transition-all cursor-pointer">
                Save Character
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  `
})
export class VideoGeneratorComponent implements OnInit, OnDestroy {
  projectId = '';
  project: Project | null = null;
  storyboard: Storyboard | null = null;
  characters: Character[] = [];
  generations: Generation[] = [];
  masterPrompt = '';
  selectedVideoUrl: string | null = null;
  pollInterval: any = null;

  // Active view tab in unified sliding studio: 'generator' | 'storyboard' | 'characters'
  activeTab: 'generator' | 'storyboard' | 'characters' = 'generator';

  // Storyboard Scene Creation State
  openAddSceneModal = false;
  savingScene = false;
  newScene: SceneRequest = {
    prompt: '',
    shotType: 'MEDIUM',
    cameraMovement: 'DOLLY',
    durationSeconds: 8,
    dialogue: '',
    sfx: ''
  };

  // Character Creation State
  openAddCharModal = false;
  savingChar = false;
  newChar: CharacterRequest = {
    name: '',
    appearance: '',
    clothing: '',
    personality: '',
    ageRange: '',
    gender: ''
  };

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService,
    private storyboardService: StoryboardService,
    private generationService: GenerationService,
    private characterService: CharacterService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    const queryTab = this.route.snapshot.queryParamMap.get('tab');
    if (queryTab === 'storyboard' || queryTab === 'characters') {
      this.activeTab = queryTab;
    }

    if (this.projectId) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  setTab(tab: 'generator' | 'storyboard' | 'characters'): void {
    this.activeTab = tab;
  }

  getSliderTransform(): string {
    if (this.activeTab === 'generator') return 'translateX(0%)';
    if (this.activeTab === 'storyboard') return 'translateX(-33.333333%)';
    return 'translateX(-66.666666%)';
  }

  loadData(): void {
    this.projectService.getProjectById(this.projectId).subscribe(res => {
      this.project = res.data;
      this.masterPrompt = this.project.masterPrompt || '';
    });

    this.loadStoryboard();
    this.loadCharacters();
    this.pollGenerations();
  }

  loadStoryboard(): void {
    this.storyboardService.getStoryboard(this.projectId).subscribe(res => {
      this.storyboard = res.data;
    });
  }

  loadCharacters(): void {
    this.characterService.getCharacters(this.projectId).subscribe(res => {
      this.characters = res.data || [];
    });
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

  // --- Storyboard Actions ---
  onCreateScene(): void {
    if (!this.newScene.prompt) return;
    this.savingScene = true;

    this.storyboardService.addScene(this.projectId, this.newScene).subscribe({
      next: () => {
        this.savingScene = false;
        this.openAddSceneModal = false;
        this.newScene = { prompt: '', shotType: 'MEDIUM', cameraMovement: 'DOLLY', durationSeconds: 8 };
        this.loadStoryboard();
      },
      error: () => this.savingScene = false
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

  // --- Character Actions ---
  onCreateCharacter(): void {
    if (!this.newChar.name) return;
    this.savingChar = true;

    this.characterService.createCharacter(this.projectId, this.newChar).subscribe({
      next: () => {
        this.savingChar = false;
        this.openAddCharModal = false;
        this.newChar = { name: '', appearance: '', clothing: '', personality: '', ageRange: '', gender: '' };
        this.loadCharacters();
      },
      error: () => this.savingChar = false
    });
  }

  onDeleteCharacter(charId: string): void {
    if (!confirm('Are you sure you want to delete this character?')) return;
    this.characterService.deleteCharacter(this.projectId, charId).subscribe({
      next: () => this.loadCharacters()
    });
  }

  onUploadReferenceImage(characterId: string, event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.storageService.getPresignedUploadUrl(file.name, 'CHARACTER_IMAGE', file.type).subscribe({
      next: presigned => {
        this.storageService.uploadFileToR2(presigned.data.uploadUrl, file).subscribe({
          next: () => {
            alert('Reference image uploaded directly to Cloudflare R2!');
            this.loadCharacters();
          }
        });
      }
    });
  }
}
