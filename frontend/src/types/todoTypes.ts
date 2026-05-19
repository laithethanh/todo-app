export interface Tag {
  id: number;
  name: string;
}

export interface TodoResponse {
  id: number;
  title: string;
  description?: string;
  status: "todo" | "done";
  priority: "low" | "medium" | "high";
  created_at: string;
  deadline?: string;
  // tags: {
  //   id: number;
  //   name: string;
  // }[];
  tags: Tag[];
}

export interface PaginatedTodoResponse {
  tasks: TodoResponse[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemPerPage: number;
}

export interface UpdateStatusRequest {
  id: number;
  status: "todo" | "done";
}

export interface UpdateTaskRequest {
  id: number;
  data: CreateRequest;
}

export interface DeleteRequest {
  id: number;
}

export interface DeleteResponse {
  message: string;
}

export interface CreateRequest {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  deadline: string;
  tags?: number[]; // Tags are sent as an array of IDs
}
