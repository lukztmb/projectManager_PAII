import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProjectService } from '../../data_access/project.service';
import { Project, ProjectStatus } from '../../models/project.model';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <section class="max-w-6xl mx-auto p-6 mt-8">
      <!-- Header Section -->
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Proyectos</h2>
          <p class="text-slate-500 mt-1 text-sm">Gestiona y supervisa el progreso de todos tus proyectos activos.</p>
        </div>
        <div>
          <a
            routerLink="/projects/create"
            class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Nuevo Proyecto</span>
          </a>
        </div>
      </header>

      <!-- Error Alert -->
      @if (error()) {
        <div class="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 animate-fade-in" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-rose-700 text-sm font-medium">{{ error() }}</span>
        </div>
      }

      <!-- Loading State Skeleton -->
      @if (isLoading()) {
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          @for (skeleton of [1, 2, 3]; track skeleton) {
            <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm animate-pulse space-y-4">
              <div class="h-5 bg-slate-200 rounded w-2/3"></div>
              <div class="h-4 bg-slate-200 rounded w-1/4"></div>
              <div class="space-y-2 pt-2">
                <div class="h-3 bg-slate-100 rounded w-5/6"></div>
                <div class="h-3 bg-slate-100 rounded w-1/2"></div>
              </div>
              <div class="flex justify-between items-center pt-4 border-t border-slate-50">
                <div class="h-4 bg-slate-100 rounded w-1/3"></div>
                <div class="h-4 bg-slate-100 rounded w-1/4"></div>
              </div>
            </div>
          }
        </div>
      } @else {
        <!-- Empty State -->
        @if (projects().length === 0 && !error()) {
          <div class="text-center bg-white border border-slate-150 rounded-2xl p-12 shadow-sm max-w-xl mx-auto mt-12 animate-fade-in">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-slate-50 rounded-2xl mb-5 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-800">No hay proyectos activos</h3>
            <p class="text-slate-500 mt-2 text-sm max-w-xs mx-auto">Comienza creando tu primer proyecto para administrar tus tareas y colaboradores.</p>
            <div class="mt-6">
              <a
                routerLink="/projects/create"
                class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-95 transition-all text-sm cursor-pointer"
              >
                Crear primer proyecto
              </a>
            </div>
          </div>
        } @else {
          <!-- Project Cards Grid -->
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            @for (project of projects(); track project.id) {
              <a
                [routerLink]="['/projects', project.id]"
                class="bg-white hover:bg-slate-50/40 border border-slate-100 hover:border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <!-- Card Header -->
                  <div class="flex items-start justify-between gap-3 mb-3">
                    <h3 class="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {{ project.name }}
                    </h3>
                    <!-- Status Badge -->
                    <span
                      class="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider shrink-0"
                      [class]="statusClasses[project.status]"
                    >
                      {{ project.status }}
                    </span>
                  </div>

                  <!-- Description -->
                  <p class="text-slate-500 text-sm line-clamp-2 mb-6">
                    {{ project.description || 'Sin descripción adicional para este proyecto.' }}
                  </p>
                </div>

                <!-- Footer details -->
                <div class="flex items-center justify-between pt-4 border-t border-slate-100 text-xs text-slate-400">
                  <div class="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{{ project.startDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <span class="text-slate-300">|</span>
                  <div class="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{{ project.endDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                </div>
              </a>
            }
          </div>
        }
      }
    </section>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
      animation: fadeIn 0.4s ease-out forwards;
    }
  `]
})
export class ProjectListComponent implements OnInit {
  private readonly projectService = inject(ProjectService);

  // Status-to-classes mapping for tailwind
  public readonly statusClasses: Record<ProjectStatus, string> = {
    [ProjectStatus.ACTIVE]: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    [ProjectStatus.CLOSED]: 'bg-slate-100 text-slate-600 border border-slate-200',
    [ProjectStatus.PLANNED]: 'bg-blue-50 text-blue-700 border border-blue-200'
  };

  // Signals for state management
  public readonly projects = signal<Project[]>([]);
  public readonly isLoading = signal<boolean>(true);
  public readonly error = signal<string | null>(null);

  public ngOnInit(): void {
    this.fetchProjects();
  }

  /**
   * Fetches the project list from the API and updates state signals.
   */
  private fetchProjects(): void {
    this.isLoading.set(true);
    this.error.set(null);

    this.projectService.getProjects().subscribe({
      next: (data: Project[]) => {
        this.projects.set(data || []);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        // error is handled and displayed in UI
        this.error.set('No se pudo establecer conexión con el servidor para obtener los proyectos.');
        this.isLoading.set(false);
      }
    });
  }
}
