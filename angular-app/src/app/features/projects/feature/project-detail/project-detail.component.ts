import { Component, inject, signal, input, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of, catchError } from 'rxjs';
import { ProjectService } from '../../data_access/project.service';
import { Project, ProjectStatus } from '../../models/project.model';
import { Task } from '../../../tasks/models/task.model';
import { TaskCardComponent } from '../../../tasks/ui/task-card/task-card.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [RouterLink, DatePipe, TaskCardComponent],
  template: `
    <section class="max-w-6xl mx-auto p-6 mt-8">
      
      <!-- Back Link -->
      <div class="mb-6">
        <a
          routerLink="/projects"
          class="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-semibold transition-colors group cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 transform group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Volver a Proyectos</span>
        </a>
      </div>

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
        <div class="space-y-8 animate-pulse">
          <!-- Header Skeleton -->
          <div class="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div class="h-7 bg-slate-200 rounded w-1/3"></div>
            <div class="h-4 bg-slate-200 rounded w-1/6"></div>
            <div class="flex gap-4 pt-2">
              <div class="h-5 bg-slate-100 rounded w-28"></div>
              <div class="h-5 bg-slate-100 rounded w-28"></div>
            </div>
          </div>
          <!-- Body Skeleton -->
          <div class="space-y-4">
            <div class="h-6 bg-slate-200 rounded w-1/4"></div>
            <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              @for (s of [1, 2, 3]; track s) {
                <div class="bg-white border border-slate-100 rounded-2xl p-6 h-40 shadow-sm"></div>
              }
            </div>
          </div>
        </div>
      } @else {
        
        <!-- Main Panel Header -->
        @if (project()) {
          <div class="bg-white border border-slate-150 rounded-2xl p-6 md:p-8 shadow-sm mb-8 animate-fade-in">
            <div class="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              
              <!-- Left side: Project Basic Info -->
              <div class="space-y-4 flex-1">
                <div class="flex flex-wrap items-center gap-3">
                  <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {{ project()?.name }}
                  </h2>
                  <span
                    class="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border"
                    [class]="statusClasses[project()!.status]"
                  >
                    {{ project()?.status }}
                  </span>
                </div>
                
                <p class="text-slate-600 text-sm leading-relaxed max-w-3xl">
                  {{ project()?.description || 'Sin descripción adicional disponible para este proyecto.' }}
                </p>
                
                <!-- Dates Info -->
                <div class="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-slate-500 pt-2">
                  <div class="flex items-center gap-1.5">
                    <span class="text-slate-400">Inicio:</span>
                    <span class="text-slate-700">{{ project()?.startDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                  <span class="hidden sm:inline text-slate-300">•</span>
                  <div class="flex items-center gap-1.5">
                    <span class="text-slate-400">Fin:</span>
                    <span class="text-slate-700">{{ project()?.endDate | date:'dd/MM/yyyy' }}</span>
                  </div>
                </div>
              </div>

              <!-- Right side: Add Task Action Button (Defensive UI) -->
              @if (project()?.status !== ProjectStatus.CLOSED) {
                <div class="shrink-0">
                  <a
                    [routerLink]="['tasks', 'create']"
                    class="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Nueva Tarea</span>
                  </a>
                </div>
              } @else {
                <!-- Optional: visual hint indicating why task creation is unavailable -->
                <div class="bg-slate-50 text-slate-500 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium flex items-center gap-2 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5 text-slate-450 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0-8V5m0 16a9 9 0 110-18 9 9 0 010 18z" />
                  </svg>
                  <span>Proyecto Cerrado - Creación deshabilitada</span>
                </div>
              }

            </div>
          </div>

          <!-- Tasks Section -->
          <div class="space-y-6">
            <h3 class="text-xl font-bold text-slate-800 tracking-tight">Tareas del Proyecto</h3>

            @if (taskLoadError()) {
              <div class="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span class="text-orange-700 text-sm font-medium">{{ taskLoadError() }}</span>
              </div>
            }

            @if (tasks().length === 0 && !taskLoadError()) {
              <!-- Empty state for project tasks -->
              <div class="text-center bg-white border border-slate-150 rounded-2xl p-10 shadow-sm max-w-md mx-auto animate-fade-in">
                <div class="inline-flex items-center justify-center w-12 h-12 bg-slate-50 rounded-xl mb-4 text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h4 class="font-bold text-slate-800">Este proyecto aún no tiene tareas asignadas</h4>
                <p class="text-slate-500 text-xs mt-1 max-w-xs mx-auto">
                  @if (project()?.status !== ProjectStatus.CLOSED) {
                    Comienza agregando una tarea en el botón "Nueva Tarea" superior.
                  } @else {
                    No es posible asignar tareas ya que el proyecto se encuentra cerrado.
                  }
                </p>
              </div>
            } @else {
              <!-- Tasks Cards Grid -->
              <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                @for (task of tasks(); track task.id) {
                  <app-task-card [task]="task" [detailsUrl]="['tasks', task.id]" />
                }
              </div>
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
export class ProjectDetailComponent {
  private readonly projectService = inject(ProjectService);
  
  // Expose Enum for HTML
  public readonly ProjectStatus = ProjectStatus;

  // HSL customized classes mapping for project status badges
  public readonly statusClasses: Record<ProjectStatus, string> = {
    [ProjectStatus.ACTIVE]: 'bg-emerald-50 text-emerald-700 border-emerald-250',
    [ProjectStatus.CLOSED]: 'bg-slate-100 text-slate-600 border-slate-200',
    [ProjectStatus.PLANNED]: 'bg-blue-50 text-blue-700 border-blue-200'
  };

  // Input Signal bounded automatically by Router parameters
  public readonly projectId = input.required<string>();

  // Reactive state signals
  public readonly project = signal<Project | null>(null);
  public readonly tasks = signal<Task[]>([]);
  public readonly isLoading = signal<boolean>(true);
  public readonly error = signal<string | null>(null);
  public readonly taskLoadError = signal<string | null>(null);

  constructor() {
    // Reacts dynamically to changes in projectId routing signal parameter
    effect(() => {
      const id = this.projectId();
      if (id) {
        this.fetchProjectData(id);
      }
    });
  }

  /**
   * Fetches both project detail and task list in parallel to avoid waterfall requests.
   */
  private fetchProjectData(id: string): void {
    this.isLoading.set(true);
    this.error.set(null);

    // forkJoin triggers both HTTP requests concurrently
    forkJoin({
      project: this.projectService.getProjectById(id),
      tasks: this.projectService.getProjectTasks(id).pipe(
        catchError(() => {
          this.taskLoadError.set('No se pudieron cargar las tareas del proyecto.');
          return of([]);
        })
      )
    }).subscribe({
      next: (result: { project: Project; tasks: Task[] }) => {
        this.project.set(result.project);
        this.tasks.set(result.tasks || []);
        this.isLoading.set(false);
      },
      error: (err: any) => {
        // error is handled and displayed in UI
        this.error.set('No se pudo establecer conexión con el servidor al intentar cargar los detalles de este proyecto.');
        this.isLoading.set(false);
      }
    });
  }
}
