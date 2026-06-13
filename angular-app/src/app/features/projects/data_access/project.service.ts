import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProjectRequest, Project } from '../models/project.model';
import { Task } from '../../tasks/models/task.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly HTTP_CLIENT = inject(HttpClient);
  private readonly BASE_API_URL = `${environment.apiUrl}/projects`;

  /**
   * Sends a GET request to fetch all projects.
   * @returns An Observable emitting an array of Project objects.
   */
  public getProjects(): Observable<Project[]> {
    return this.HTTP_CLIENT.get<Project[]>(this.BASE_API_URL);
  }

  /**
   * Sends a GET request to fetch a specific project by its ID.
   * @param id The project ID.
   * @returns An Observable emitting the Project object.
   */
  public getProjectById(id: string | number): Observable<Project> {
    return this.HTTP_CLIENT.get<Project>(`${this.BASE_API_URL}/${id}`);
  }

  /**
   * Sends a GET request to fetch tasks belonging to a specific project.
   * @param projectId The project ID.
   * @returns An Observable emitting an array of Task objects.
   */
  public getProjectTasks(projectId: string | number): Observable<Task[]> {
    return this.HTTP_CLIENT.get<Task[]>(`${this.BASE_API_URL}/${projectId}/tasks`);
  }

  /**
   * Sends a POST request to create a new project.
   * @param payload The project data to be created.
   * @returns An Observable emitting the created project response.
   */
  public createProject(payload: ProjectRequest): Observable<any> {
    return this.HTTP_CLIENT.post<any>(this.BASE_API_URL, payload);
  }
}