/**
 * Represents a comment associated with a task.
 */
export interface TaskComment {
  id: number;
  text: string;
  author: string;
  createdAt?: string;
}

/**
 * Data Transfer Object (DTO) for creating a new comment.
 */
export interface TaskCommentRequest {
  text: string;
  author: string;
}