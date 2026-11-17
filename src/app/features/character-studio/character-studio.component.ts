import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CharacterService } from '@core/services/character.service';
import { StorageService } from '@core/services/storage.service';
import { Character, CharacterRequest } from '@core/models/character.model';

@Component({
  selector: 'app-character-studio',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="p-4 sm:p-6 lg:p-8 space-y-6 pb-24 md:pb-8 max-w-7xl mx-auto">
      <!-- Breadcrumb & Header -->
      <div>
        <a [routerLink]="['/project', projectId, 'generator']" class="text-xs text-brand-400 hover:underline flex items-center gap-1 mb-2">
          ← Back to Studio Generator
        </a>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Character Studio</h1>
            <p class="text-sm text-slate-400 mt-1">Design consistent characters with reference images for Gemini Veo prompts</p>
          </div>
          <button (click)="openModal = true"
                  class="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-brand-600/25 min-h-[44px]">
            + Add Character
          </button>
        </div>
      </div>

      <!-- Character Grid -->
      <div *ngIf="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div *ngFor="let i of [1,2]" class="h-64 bg-dark-900 border border-dark-800 rounded-2xl animate-pulse"></div>
      </div>

      <div *ngIf="!loading && characters.length === 0" class="text-center py-16 bg-dark-900 border border-dark-800 rounded-2xl p-8 space-y-3">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-dark-850 flex items-center justify-center text-3xl">👤</div>
        <h3 class="text-lg font-bold text-white">No characters added yet</h3>
        <p class="text-sm text-slate-400 max-w-md mx-auto">Add characters with appearance details and reference images to ensure consistent faces and clothing across all scenes.</p>
        <button (click)="openModal = true" class="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium">
          Add First Character
        </button>
      </div>

      <div *ngIf="!loading && characters.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div *ngFor="let c of characters" class="bg-dark-900 border border-dark-800 rounded-2xl p-5 space-y-4 shadow-lg flex flex-col justify-between">
          <div class="space-y-3">
            <!-- Avatar / Primary Image Preview -->
            <div class="w-full h-44 bg-dark-950 rounded-xl overflow-hidden border border-dark-800 flex items-center justify-center relative group">
              <img *ngIf="c.primaryImageUrl" [src]="c.primaryImageUrl" class="w-full h-full object-cover" />
              <div *ngIf="!c.primaryImageUrl" class="text-4xl text-slate-700">👤</div>

              <!-- Upload Overlay -->
              <label class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-xs text-white">
                <span>Upload Reference</span>
                <input type="file" (change)="onUploadReferenceImage(c.id, $event)" accept="image/*" class="hidden" />
              </label>
            </div>

            <div>
              <h3 class="text-lg font-bold text-white">{{ c.name }}</h3>
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
            <button (click)="onDelete(c.id)" class="text-xs text-red-400 hover:text-red-300 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>

      <!-- Add Character Modal / Bottom Sheet -->
      <div *ngIf="openModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="w-full max-w-lg bg-dark-900 border border-dark-800 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-white">Add Consistent Character</h3>
            <button (click)="openModal = false" class="text-slate-500 hover:text-white text-lg">✕</button>
          </div>

          <form (ngSubmit)="onCreateCharacter()" class="space-y-3">
            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Character Name *</label>
              <input type="text" [(ngModel)]="newChar.name" name="name" required
                     class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-500"
                     placeholder="Detective Marcus Cole" />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Age Range</label>
                <input type="text" [(ngModel)]="newChar.ageRange" name="ageRange"
                       class="w-full bg-dark-850 border border-dark-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                       placeholder="Mid-40s" />
              </div>
              <div>
                <label class="block text-xs font-medium text-slate-300 mb-1">Gender</label>
                <input type="text" [(ngModel)]="newChar.gender" name="gender"
                       class="w-full bg-dark-850 border border-dark-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                       placeholder="Male" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Appearance (Hair, face, build)</label>
              <textarea [(ngModel)]="newChar.appearance" name="appearance" rows="2"
                        class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                        placeholder="Weathered face, short salt-and-pepper hair, scar over left eyebrow"></textarea>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Signature Outfit</label>
              <textarea [(ngModel)]="newChar.clothing" name="clothing" rows="2"
                        class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                        placeholder="Dark grey trenchcoat with popped collar, loosened burgundy tie"></textarea>
            </div>

            <div>
              <label class="block text-xs font-medium text-slate-300 mb-1">Personality / Vibe</label>
              <input type="text" [(ngModel)]="newChar.personality" name="personality"
                     class="w-full bg-dark-850 border border-dark-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-500"
                     placeholder="Stoic, cynical, weary detective" />
            </div>

            <div class="flex justify-end gap-3 pt-3">
              <button type="button" (click)="openModal = false"
                      class="px-4 py-2 bg-dark-800 hover:bg-dark-700 text-slate-300 rounded-xl text-sm font-medium">
                Cancel
              </button>
              <button type="submit" [disabled]="saving"
                      class="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-medium transition-all">
                Save Character
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class CharacterStudioComponent implements OnInit {
  projectId = '';
  characters: Character[] = [];
  loading = true;
  openModal = false;
  saving = false;

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
    private characterService: CharacterService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.projectId = this.route.snapshot.paramMap.get('id') || '';
    if (this.projectId) this.loadCharacters();
  }

  loadCharacters(): void {
    this.loading = true;
    this.characterService.getCharacters(this.projectId).subscribe({
      next: res => {
        this.characters = res.data || [];
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onCreateCharacter(): void {
    if (!this.newChar.name) return;
    this.saving = true;

    this.characterService.createCharacter(this.projectId, this.newChar).subscribe({
      next: () => {
        this.saving = false;
        this.openModal = false;
        this.newChar = { name: '', appearance: '', clothing: '', personality: '', ageRange: '', gender: '' };
        this.loadCharacters();
      },
      error: () => this.saving = false
    });
  }

  onDelete(charId: string): void {
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
