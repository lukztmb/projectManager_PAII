import { Component, inject, signal } from '@angular/core';
import { 
  ReactiveFormsModule, 
  FormGroup, 
  FormControl, 
  Validators, 
  AbstractControl, 
  ValidationErrors 
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProjectService } from '../../data_access/project.service';
import { ProjectStatus, ProjectRequest } from '../../models/project.model';

@Component({
  selector: 'app-project-create',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="max-w-2xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-md">
      <header class="mb-6 border-b pb-4">
        <h2 class="text-2xl font-bold text-gray-900">Create New Project</h2>
        <p class="text-gray-600 text-sm mt-1">Fill in the details to start a new project.</p>
      </header>

      @if (globalError()) {
        <div class="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p class="font-medium">{{ globalError() }}</p>
        </div>
      }

      @if (successMessage()) {
        <div class="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p class="font-medium">{{ successMessage() }}</p>
        </div>
      }

      <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="space-y-6">
        
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
          <input 
            type="text" 
            id="name" 
            formControlName="name"
            class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            [class.border-red-500]="isFieldInvalid('name')"
            placeholder="e.g., Website Redesign"
          >
          @if (isFieldInvalid('name')) {
            <p class="mt-1 text-sm text-red-600">Name is required.</p>
          }
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input 
              type="date" 
              id="startDate" 
              formControlName="startDate"
              class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="isFieldInvalid('startDate')"
            >
          </div>

          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
            <input 
              type="date" 
              id="endDate" 
              formControlName="endDate"
              class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              [class.border-red-500]="isFieldInvalid('endDate') || projectForm.errors?.['dateRangeInvalid']"
            >
            @if (projectForm.get('endDate')?.hasError('pastDate')) {
              <p class="mt-1 text-sm text-red-600">End date cannot be in the past.</p>
            }
          </div>
        </div>
        
        @if (projectForm.errors?.['dateRangeInvalid'] && (projectForm.touched || projectForm.dirty)) {
          <p class="text-sm text-red-600">End date must be greater than or equal to the start date.</p>
        }

        <div>
          <label for="status" class="block text-sm font-medium text-gray-700 mb-1">Initial Status *</label>
          <select 
            id="status" 
            formControlName="status"
            class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option [value]="ProjectStatus.PLANNED">Planned</option>
            <option [value]="ProjectStatus.ACTIVE">Active</option>
          </select>
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
          <textarea 
            id="description" 
            formControlName="description"
            rows="3"
            class="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Brief project description..."
          ></textarea>
        </div>

        <div class="pt-4 border-t flex justify-end">
          <button 
            type="submit" 
            [disabled]="projectForm.invalid || isSubmitting()"
            class="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            @if (isSubmitting()) {
              <span>Saving...</span>
            } @else {
              <span>Create Project</span>
            }
          </button>
        </div>
      </form>
    </section>
  `
})
export class ProjectCreateComponent {
  private readonly projectService = inject(ProjectService);
  
  // Expose Enum to the template
  public readonly ProjectStatus = ProjectStatus;

  // Local state signals
  public readonly isSubmitting = signal<boolean>(false);
  public readonly globalError = signal<string | null>(null);
  public readonly successMessage = signal<string | null>(null);

  // Strongly typed form definition
  public projectForm = new FormGroup({
    name: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    startDate: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    endDate: new FormControl<string>('', { validators: [Validators.required, this.futureDateValidator], nonNullable: true }),
    status: new FormControl<ProjectStatus>(ProjectStatus.PLANNED, { validators: [Validators.required], nonNullable: true }),
    description: new FormControl<string>('', { nonNullable: true })
  }, { validators: this.dateRangeValidator });

  /**
   * Custom validator to ensure endDate is greater than or equal to startDate.
   * Applied at the FormGroup level.
   */
  private dateRangeValidator(control: AbstractControl): ValidationErrors | null {
    const start = control.get('startDate')?.value;
    const end = control.get('endDate')?.value;

    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (endDate < startDate) {
        return { dateRangeInvalid: true };
      }
    }
    return null;
  }

  /**
   * Custom validator to ensure a date is not in the past (before today).
   * Applied at the FormControl level (endDate).
   */
  private futureDateValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    
    const inputDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for fair comparison

    if (inputDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  /**
   * Helper method for the template to check field validity.
   */
  public isFieldInvalid(fieldName: string): boolean {
    const field = this.projectForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  /**
   * Handles the form submission.
   */
  public onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.globalError.set(null);
    this.successMessage.set(null);

    const payload: ProjectRequest = this.projectForm.getRawValue();

    this.projectService.createProject(payload).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('Project created successfully!');
        this.projectForm.reset({ status: ProjectStatus.PLANNED }); // Reset to default valid state
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        // Business Rule: Handle 409 Conflict
        if (error.status === 409) {
          this.globalError.set('A project with this name already exists. Please choose a different name.');
        } else if (error.status === 400) {
          this.globalError.set('Validation error from server. Please check your inputs.');
        } else {
          this.globalError.set('An unexpected error occurred. Please try again later.');
        }
      }
    });
  }
}