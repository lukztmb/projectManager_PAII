import { Component, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { TaskCommentRequest } from '../../models/task-comment.model';

@Component({
  selector: 'app-comment-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="commentForm" (ngSubmit)="submitComment()" class="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h4 class="text-sm font-semibold text-gray-700 mb-3">Add a Comment</h4>
      
      <div class="space-y-3">
        <div>
          <input 
            type="text" 
            formControlName="author"
            placeholder="Your Name (Author) *"
            class="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
        </div>
        
        <div>
          <textarea 
            formControlName="text"
            placeholder="Write your comment here... *"
            rows="2"
            class="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <div class="flex justify-end">
          <button 
            type="submit" 
            [disabled]="commentForm.invalid"
            class="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Post Comment
          </button>
        </div>
      </div>
    </form>
  `
})
export class CommentFormComponent {
  // Angular 21 Output API to emit the payload to the parent component
  public readonly commentSubmitted = output<TaskCommentRequest>();

  public commentForm = new FormGroup({
    author: new FormControl<string>('', { validators: [Validators.required], nonNullable: true }),
    text: new FormControl<string>('', { validators: [Validators.required], nonNullable: true })
  });

  public submitComment(): void {
    if (this.commentForm.valid) {
      this.commentSubmitted.emit(this.commentForm.getRawValue());
      // Reset the form for subsequent comments
      this.commentForm.reset();
    }
  }
}