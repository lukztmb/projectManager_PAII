import { Component, OnInit, inject, signal } from '@angular/core';
import { TaskService } from '../../data_access/task.service';
import { Task } from '../../models/task.model';
import { TaskCardComponent } from '../../ui/task-card/task-card.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [TaskCardComponent],
  template: `
    <section class="max-w-5xl mx-auto p-6">
      <header class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900">Tareas en Progreso</h2>
        <p class="text-gray-600 mt-1">Listado de todas las tareas activas en el sistema.</p>
      </header>

      @if (errorMessage()) {
        <div class="p-4 mb-6 text-red-800 bg-red-100 rounded-lg border border-red-200" role="alert">
          {{ errorMessage() }}
        </div>
      }

      @if (isLoading()) {
        <div class="flex justify-center items-center p-12">
          <div class="animate-pulse flex flex-col items-center">
            <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span class="mt-4 text-gray-500 font-medium">Cargando tareas...</span>
          </div>
        </div>
      } @else {
        
        @if (tasks().length === 0 && !errorMessage()) {
          <div class="p-12 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <p class="text-gray-600 font-medium text-lg">No hay tareas en progreso actualmente.</p>
          </div>
        } @else {
          
          <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            @for (task of tasks(); track task.id) {
              <app-task-card [task]="task" />
            }
          </div>
        }
      }
    </section>
  `
})
export class TaskListComponent implements OnInit {
  // Dependency Injection using the inject() function (Modern Angular pattern)
  private readonly taskService = inject(TaskService);

  // Local state managed via Signals for fine-grained reactivity
  public readonly tasks = signal<Task[]>([]);
  public readonly isLoading = signal<boolean>(true);
  public readonly errorMessage = signal<string | null>(null);

  private readonly STATUS_IN_PROGRESS = 'IN_PROGRESS';

  public ngOnInit(): void {
    this.fetchInProgressTasks();
  }

  /**
   * Orchestrates the fetching of tasks and updating the local state signals
   * based on the HTTP response (Success or Error).
   */
  private fetchInProgressTasks(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.taskService.getTasksByStatus(this.STATUS_IN_PROGRESS).subscribe({
      next: (response: Task[]) => {
        this.tasks.set(response);
        this.isLoading.set(false);
      },
      error: (errorResponse: unknown) => {
        console.error('Failed to fetch tasks:', errorResponse);
        this.errorMessage.set('Hubo un problema de comunicación con el servidor al intentar obtener las tareas.');
        this.isLoading.set(false);
      }
    });
  }
}