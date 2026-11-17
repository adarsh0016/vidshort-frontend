import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { CharacterStudioComponent } from './features/character-studio/character-studio.component';
import { StoryboardBuilderComponent } from './features/storyboard/storyboard-builder.component';
import { VideoGeneratorComponent } from './features/video-generator/video-generator.component';
import { GalleryComponent } from './features/gallery/gallery.component';
import { SettingsComponent } from './features/settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'project/:id/characters', component: CharacterStudioComponent, canActivate: [authGuard] },
  { path: 'project/:id/storyboard', component: StoryboardBuilderComponent, canActivate: [authGuard] },
  { path: 'project/:id/generator', component: VideoGeneratorComponent, canActivate: [authGuard] },
  { path: 'gallery', component: GalleryComponent, canActivate: [authGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'dashboard' }
];
