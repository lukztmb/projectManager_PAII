import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50">
      <!-- Fixed Navigation Bar -->
      <nav class="bg-slate-900 border-b border-slate-800 text-slate-200 fixed top-0 left-0 right-0 z-50 h-16">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div class="flex items-center justify-between h-full">
            
            <!-- Left Side: Brand & Links -->
            <div class="flex items-center gap-8">
              <!-- Brand Logo -->
              <a routerLink="/projects" class="flex items-center gap-2.5 group">
                <div class="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-lg flex items-center justify-center shadow-md shadow-indigo-500/10 group-hover:scale-105 transition-transform duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <span class="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">ProjectManager</span>
              </a>

              <!-- Desktop Navigation Links (md breakpoint) -->
              <div class="hidden md:flex items-center gap-1.5">
                <a
                  routerLink="/projects"
                  routerLinkActive="bg-slate-800 text-indigo-400 font-medium"
                  [routerLinkActiveOptions]="{ exact: true }"
                  class="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all duration-200"
                >
                  Proyectos
                </a>
                <a
                  routerLink="/tasks/in-progress"
                  routerLinkActive="bg-slate-800 text-indigo-400 font-medium"
                  class="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all duration-200"
                >
                  Tareas Activas
                </a>
                <a
                  routerLink="/projects/create"
                  routerLinkActive="bg-slate-800 text-indigo-400 font-medium"
                  class="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all duration-200"
                >
                  Nuevo Proyecto
                </a>
              </div>
            </div>

            <!-- Right Side: User Profile & Actions -->
            <div class="flex items-center gap-4">
              @if (currentUser()) {
                <div class="flex items-center gap-3">
                  <div class="hidden sm:flex flex-col text-right">
                    <span class="text-xs text-slate-500 font-medium uppercase tracking-wider">Colaborador</span>
                    <span class="text-sm font-semibold text-slate-300">{{ currentUser()?.email }}</span>
                  </div>
                  
                  <div class="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold text-sm shadow-inner uppercase">
                    {{ currentUser()?.email?.charAt(0) }}
                  </div>
                </div>
              }

              <!-- Logout Button -->
              <button
                (click)="logout()"
                title="Cerrar sesión"
                class="flex items-center justify-center w-9 h-9 bg-slate-850 hover:bg-rose-500/10 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 text-slate-400 rounded-lg active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>

              <!-- Mobile Menu Toggle (md hidden) -->
              <button
                (click)="toggleMobileMenu()"
                class="md:hidden flex items-center justify-center w-9 h-9 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg active:scale-95 transition-all duration-200 cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  @if (isMobileMenuOpen()) {
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  } @else {
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            </div>

          </div>
        </div>

        <!-- Collapsible Mobile Navigation Menu -->
        @if (isMobileMenuOpen()) {
          <div class="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-1.5 animate-fade-in shadow-xl">
            <a
              routerLink="/projects"
              routerLinkActive="bg-slate-800 text-indigo-400 font-medium"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="closeMobileMenu()"
              class="block px-3 py-2 rounded-lg text-base text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all duration-200"
            >
              Proyectos
            </a>
            <a
              routerLink="/tasks/in-progress"
              routerLinkActive="bg-slate-800 text-indigo-400 font-medium"
              (click)="closeMobileMenu()"
              class="block px-3 py-2 rounded-lg text-base text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all duration-200"
            >
              Tareas Activas
            </a>
            <a
              routerLink="/projects/create"
              routerLinkActive="bg-slate-800 text-indigo-400 font-medium"
              (click)="closeMobileMenu()"
              class="block px-3 py-2 rounded-lg text-base text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-all duration-200"
            >
              Nuevo Proyecto
            </a>
          </div>
        }
      </nav>

      <!-- Main Layout Body Content -->
      <main class="flex-1 pt-16 flex flex-col">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.2s ease-out forwards;
    }
  `]
})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);

  // Writable signal to manage mobile menu toggle state
  public readonly isMobileMenuOpen = signal<boolean>(false);

  // Read-only user session details
  public readonly currentUser = this.authService.currentUser;

  /**
   * Toggles the collapsible navigation menu on mobile devices.
   */
  public toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(open => !open);
  }

  /**
   * Closes the collapsible navigation menu on mobile devices.
   */
  public closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  /**
   * Triggers the user logout routine via AuthService.
   */
  public logout(): void {
    this.authService.logout();
  }
}
