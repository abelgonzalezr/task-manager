export enum TaskStatus {
  TODO = "to_do",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed"
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  user_id: string;
  created_at: string;
  updated_at: string | null;
}

export interface TaskCreate {
  title: string;
  description: string;
  status: TaskStatus;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: TaskStatus;
} 