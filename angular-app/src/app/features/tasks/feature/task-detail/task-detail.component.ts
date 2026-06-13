import { Component, OnInit, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskService } from '../../data_access/task.service';
import { Task } from '../../models/task.model';
import { TaskCommentRequest } from '../../models/task-comment.model';
import { CommentFormComponent } from '../../ui/comment-form/comment-form.component';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [DatePipe, CommentFormComponent],
  template: `
    <section class="max-w-4xl mx-auto p-6 mt-6">
      @if (globalError()) {
        <div class="p-6 bg-red-50 border-2 border-red-500 rounded-lg text-center">
          <h2 class="text-xl font-bold text-red-700 mb-2">Access Denied</h2>
          <p class="text-red-600">{{ globalError() }}</p>
        </div>
      }

      @if (isLoading()) {
        <div class="flex justify-center p-12">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }

      @if (task(); as currentTask) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          <header class="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start">
            <div>
              <span class="text-xs font-semibold tracking-wider text-blue-600 uppercase mb-1 block">
                Task #{{ currentTask.id }}
              </span>
              <h2 class="text-2xl font-bold text-gray-900">{{ currentTask.title }}</h2>
            </div>
            <span class="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
              {{ currentTask.status }}
            </span>
          </header>

          <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 space-y-6">
              
              <section>
                <h3 class="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Comments</h3>
                
                <div class="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  @for (comment of currentTask.comments; track comment.id) {
                    <article class="p-4 bg-gray-50 rounded-lg">
                      <div class="flex justify-between items-baseline mb-1">
                        <span class="font-semibold text-gray-900">{{ comment.author }}</span>
                        <span class="text-xs text-gray-500">{{ comment.createdAt | date:'medium' }}</span>
                      </div>
                      <p class="text-gray-700 text-sm">{{ comment.text }}</p>
                    </article>
                  } @empty {
                    <p class="text-gray-500 italic text-sm">No comments yet. Be the first to comment!</p>
                  }
                </div>

                <app-comment-form (commentSubmitted)="handleNewComment($event)" />
                
                @if (isSubmittingComment()) {
                  <p class="text-sm text-blue-600 mt-2 animate-pulse">Adding comment...</p>
                }
              </section>

            </div>

            <aside class="space-y-4 text-sm text-gray-600">
              <div class="p-4 bg-gray-50 rounded-lg">
                <p class="mb-2"><strong class="text-gray-900">Assignee:</strong> <br>{{ currentTask.assignee || 'Unassigned' }}</p>
                <p class="mb-2"><strong class="text-gray-900">Estimate:</strong> <br>{{ currentTask.estimatedHours }} hrs</p>
              </div>
            </aside>
          </div>

        </div>
      }
    </section>
  `
})
export class TaskDetailComponent implements OnInit {
  private readonly taskService = inject(TaskService);

  // Router Input Binding
  public readonly projectId = input.required<string>();
  public readonly taskId = input.required<string>();

  // Local state signals
  public readonly task = signal<Task | null>(null);
  public readonly isLoading = signal<boolean>(true);
  public readonly globalError = signal<string | null>(null);
  public readonly isSubmittingComment = signal<boolean>(false);

  public ngOnInit(): void {
    this.loadTaskDetails();
  }

  /**
   * Fetches the task details hydrating it with comments.
   */
  private loadTaskDetails(): void {
    this.isLoading.set(true);
    this.globalError.set(null);

    // Business Rule: Include comments=true
    this.taskService.getTaskById(this.projectId(), this.taskId(), true).subscribe({
      next: (response: Task) => {
        // Ensure comments array is at least initialized
        if (!response.comments) response.comments = [];
        this.task.set(response);
        this.isLoading.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading.set(false);
        // Business Rule: Hierarchy Violation (404 Not Found)
        if (error.status === 404) {
          this.globalError.set('The task does not belong to the referenced project or does not exist.');
        } else {
          this.globalError.set('An unexpected error occurred while fetching the task.');
        }
      }
    });
  }

  /**
   * Handles the event emitted by the CommentFormComponent.
   * @param payload The comment data to send to the API.
   */
  public handleNewComment(payload: TaskCommentRequest): void {
    this.isSubmittingComment.set(true);

    this.taskService.addCommentToTask(this.projectId(), this.taskId(), payload).subscribe({
      next: (newComment) => {
        // Optimistic / Reactive Update: Add the comment to the local signal without reloading
        this.task.update(currentTask => {
          if (!currentTask) return currentTask;
          return {
            ...currentTask,
            comments: [...(currentTask.comments || []), newComment]
          };
        });
        this.isSubmittingComment.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmittingComment.set(false);
        console.error('Failed to add comment', error);
        // In a real app, we might want to use a toast notification here instead of globalError
        alert('Failed to add comment. Please try again.'); 
      }
    });
  }
}