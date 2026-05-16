export interface TodoResponse {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "done";
  priority: "low" | "medium" | "high";
  created_at: string;
  deadline?: string;
}

export interface UpdateStatusRequest {
  id: number;
  status: string;
}

export interface UpdateTaskRequest {
  id: number;
  data: Partial<TodoResponse>;
}
