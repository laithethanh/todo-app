import { TodoResponse, UpdateStatusRequest, UpdateTaskRequest } from "../types";
import api from "./api";

export const todoService = {
  getAllTasks: async (): Promise<TodoResponse[]> => {
    const res = await api.get<TodoResponse[]>("/todos");
    return res.data;
  },
  getAllTasksById: async (): Promise<TodoResponse[]> => {
    const res = await api.get<TodoResponse[]>("/todos/me");
    return res.data;
  },

  updateTaskStatus: async ({
    id,
    status,
  }: UpdateStatusRequest): Promise<TodoResponse> => {
    const res = await api.patch<TodoResponse>(`/todos/${id}/status`, {
      status,
    });
    return res.data;
  },

  updateTask: async ({
    id,
    data,
  }: UpdateTaskRequest): Promise<TodoResponse> => {
    const res = await api.patch<TodoResponse>(`/todos/${id}`, data);
    return res.data;
  },
};

export default todoService;
