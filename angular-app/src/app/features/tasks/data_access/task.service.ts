import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskRequest } from '../models/task.model';
import { TaskComment, TaskCommentRequest } from '../models/task-comment.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly HTTP_CLIENT = inject(HttpClient);
  
  private readonly BASE_API_URL = `${environment.apiUrl}/projects/tasks`; 
  private readonly PROJECTS_API_URL = `${environment.apiUrl}/projects`;

  /**
   * Fetches a specific task.
   * @param projectId The parent project ID.
   * @param taskId The task ID.
   * @param includeComments Business Rule: Hydrates the response with the comments list if true.
   */
  public getTaskById(projectId: string | number, taskId: string | number, includeComments: boolean = false): Observable<Task> {
    const url = `${this.PROJECTS_API_URL}/${projectId}/tasks/${taskId}`;
    let params = new HttpParams();
    if (includeComments) {
      params = params.set('comments', 'true');
    }
    return this.HTTP_CLIENT.get<Task>(url, { params });
  }

  /**
   * Fetches tasks from the backend filtered by their current status.
   * @param status The status of the tasks to retrieve (e.g., 'IN_PROGRESS')
   * @returns An Observable emitting an array of Task objects.
   */
  public getTasksByStatus(status: string): Observable<Task[]> {
    const params = new HttpParams().set('status', status);
    return this.HTTP_CLIENT.get<Task[]>(this.BASE_API_URL, { params });
  }

  /**
   * Creates a new task under a specific project.
   * @param projectId The ID of the parent project.
   * @param payload The task data to be created.
   * @returns An Observable emitting the created task response.
   */
  public createTask(projectId: string | number, payload: TaskRequest): Observable<Task> {
    const url = `${this.PROJECTS_API_URL}/${projectId}/tasks`;
    return this.HTTP_CLIENT.post<Task>(url, payload);
  }

  /**
   * Adds a new comment to a specific task.
   */
  public addCommentToTask(projectId: string | number, taskId: string | number, payload: TaskCommentRequest): Observable<TaskComment> {
    const url = `${this.PROJECTS_API_URL}/${projectId}/tasks/${taskId}/comments`;
    return this.HTTP_CLIENT.post<TaskComment>(url, payload);
  }
}