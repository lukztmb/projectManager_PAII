import { TaskComment } from './task-comment.model';

/**
 * Represents the structure of a Task returned by the backend API.
 * Ensures strict typing across the frontend application.
 */
export interface Task {
  id: number;
  title: string;
  estimatedHours: number;
  assignee: string | null;
  status: string;
  finishedAt?: string | null;
  createdAt?: string;
  comments?: TaskComment[];
}
/**
 * Represents the valid statuses a task can have.
 */
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

/**
 * Data Transfer Object (DTO) for creating a new task.
 */
export interface TaskRequest {
  title: string;
  estimatedHours: number;
  assignee?: string | null;
  status: TaskStatus;
}