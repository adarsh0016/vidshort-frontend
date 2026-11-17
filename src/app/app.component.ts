import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { MobileNavComponent } from './shared/components/mobile-nav/mobile-nav.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, MobileNavComponent],
  template: `
    <div class="min-h-screen bg-dark-950 text-slate-100 flex flex-col md:flex-row">
      <!-- Desktop Sidebar -->
      <app-sidebar *ngIf="authService.isAuthenticated()"></app-sidebar>

      <!-- Main Content Area -->
      <main class="flex-1 w-full overflow-y-auto">
        <router-outlet></router-outlet>
      </main>

      <!-- Mobile Bottom Navigation (only on screens < md) -->
      <app-mobile-nav *ngIf="authService.isAuthenticated()"></app-mobile-nav>
    </div>
  `
})
export class AppComponent {
  constructor(public authService: AuthService) {}
}
