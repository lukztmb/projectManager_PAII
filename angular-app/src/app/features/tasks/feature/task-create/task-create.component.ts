import { Component, inject, input, signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskService } from '../../data_access/task.service';
import { TaskStatus, TaskRequest } from '../../models/task.model';

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-md">
      <header class="mb-6 border-b pb-4">
        <h2 class="text-2xl font-bold text-gray-900">Create New Task</h2>
        <p class="text-gray-600 text-sm mt-1">Adding task to Project ID: <span class="font-semibold">{{ projectId() }}</span></p>
      </header>

      @if (globalError()) {
        <div class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p class="font-medium">{{ globalError() }}</p>
        </div>
      }

      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="space-y-6">
        
        <div>
          <label for="title" class="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
          <input 
            type="text" 
            id="title" 
            formControlName="title"
            class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            [class.border-red-500]="isFieldInvalid('title')"
            placeholder="e.g., Create landing page"
          >
          @if (isFieldInvalid('title')) {
            <p class="mt-1 text-sm text-red-600">Title is required.</p>
          }
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="estimatedHours" class="block text-sm font-medium text-gray-700 mb-1">Estimate (Hours) *</label>
            <input 
              type="number" 
              id="estimatedHours" 
              formControlName="estimatedHours"
              min="1"
              class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="isFieldInvalid('estimatedHours')"
            >
            @if (taskForm.get('estimatedHours')?.hasError('min')) {
              <p class="mt-1 text-sm text-red-600">Estimate must be greater than 0.</p>
            }
          </div>

          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select 
              id="status" 
              formControlName="status"
              class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option [value]="TaskStatus.TODO">To Do</option>
              <option [value]="TaskStatus.IN_PROGRESS">In Progress</option>
              <option [value]="TaskStatus.DONE">Done</option>
            </select>
          </div>
        </div>

        <div>
          <label for="assignee" class="block text-sm font-medium text-gray-700 mb-1">Assignee (Optional)</label>
          <input 
            type="text" 
            id="assignee" 
            formControlName="assignee"
            class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., alice"
          >
        </div>

        <div class="pt-4 border-t flex justify-end gap-3">
          <button 
            type="button"
            (click)="navigateBack()"
            class="px-6 py-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            [disabled]="taskForm.invalid || isSubmitting()"
            class="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            @if (isSubmitting()) {
              <span>Saving...</span>
            } @else {
              <span>Create Task</span>
            }
          </button>
        </div>
      </form>
    </section>
  `
})
export class TaskCreateComponent {
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);

  // Router Input Binding: Automatically receives the ':projectId' from the URL
  public readonly projectId = input.required<string>();
  
  // Expose Enum to template
  public readonly TaskStatus = TaskStatus;

  // Local state signals
  public readonly isSubmitting = signal<boolean>(false);
  public readonly globalError = signal<string | null>(null);

  // Strictly typed form
  public taskForm = new FormGroup({
    title: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    // Business Rule: Estimate must be > 0. We use Validators.min(1)
    estimatedHours: new FormControl<number>(1, { validators: [Validators.required, Validators.min(1)], nonNullable: true }),
    status: new FormControl<TaskStatus>(TaskStatus.TODO, { validators: [Validators.required], nonNullable: true }),
    assignee: new FormControl<string | null>(null)
  });

  /**
   * Helper method for the template to check field validity.
   */
  public isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  /**
   * Navigates back to the project's task list.
   */
  public navigateBack(): void {
    // Assuming you will have a route like /projects/1/tasks
    this.router.navigate(['/projects', this.projectId(), 'tasks']);
  }

  /**
   * Handles form submission.
   */
  public onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.globalError.set(null);

    const payload: TaskRequest = this.taskForm.getRawValue();

    this.taskService.createTask(this.projectId(), payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        // Happy Path: Redirect on success
        this.navigateBack();
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        // Business Rule: Handle 409 Conflict if Project is CLOSED
        if (error.status === 409) {
          this.globalError.set('Cannot add tasks to a CLOSED project. Please check the project status.');
        } else if (error.status === 404) {
          this.globalError.set('The project was not found. It may have been deleted.');
        } else {
          this.globalError.set('An unexpected error occurred. Please try again.');
        }
      }
    });
  }
}