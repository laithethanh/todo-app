import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import {
  FaTrash,
  FaCalendarAlt,
  FaClock,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import { CreateRequest, TodoResponse as Todo, Tag } from "../types";
import todoService from "../services/todoService";
import tagService from "../services/tagService";
// import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import ConfirmModal from "../components/common/ConfirmModal";

export default function TodoList() {
  // const [searchParams, setSearchParams] = useSearchParams();
  // console.log(searchParams);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [selectedTodoId, setSelectedTodoId] = useState<number | null>(null);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);

  // State cho việc thêm mới task
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState<CreateRequest>({
    title: "",
    description: "",
    priority: "medium",
    deadline: "",
    tags: [],
  });

  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // State cho việc chỉnh sửa task
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null); // Keep Todo type for editingTodo
  const [editForm, setEditForm] = useState<CreateRequest>({
    title: "",
    description: "",
    priority: "medium",
    deadline: "",
    tags: [],
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        // Gọi song song cả tasks và tags từ backend
        // Lưu ý: Đảm bảo baseURL của axios đã được cấu hình trỏ đến backend
        const [tasksData, tagsRes] = await Promise.all([
          todoService.getAllTasksById().catch(() => []), // Trả về mảng rỗng nếu lỗi
          tagService.getAllTags().catch(() => []), // Trả về mảng rỗng nếu gọi API thất bại
        ]);

        setTodos(Array.isArray(tasksData) ? tasksData : []);
        setAvailableTags(Array.isArray(tagsRes) ? tagsRes : []);
      } catch (error) {
        const axiosError = error as AxiosError;
        if (axiosError.response?.status !== 404) {
          console.error("Failed to fetch data:", error);
        }
        if (!todos.length) setTodos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Chỉ nên gọi một lần khi mount để tránh loop hoặc refetch không cần thiết

  const confirmDeleteAction = async () => {
    if (!selectedTodoId) return;

    try {
      await todoService.deleteOneTask({ id: selectedTodoId });
      setTodos((prev) => prev.filter((todo) => todo.id !== selectedTodoId));
      // Không nên dùng reload thế này vì sẽ mất toast và màn hình sẽ bị giật, hiện loading
      // window.location.reload()
      toast.success("Xóa công việc thành công!");
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Có lỗi xảy ra khi xóa công việc!");
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedTodoId(null);
    }
  };

  // toggle done
  const toggleTodo = async (id: number) => {
    const todoToUpdate = todos.find((t) => t.id === id);
    if (!todoToUpdate) return;

    const newStatus = todoToUpdate.status === "todo" ? "done" : "todo";

    try {
      const updatedTodo = await todoService.updateTaskStatus({
        id,
        status: newStatus,
      });
      if (updatedTodo.status === "done") {
        toast.success("Chúc mừng bạn đã hoàn thành công việc.");
      } else {
        toast.success("Đã hoàn tác công việc!");
      }
      // Cập nhật lại danh sách local bằng dữ liệu chuẩn từ server trả về
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo)),
      );
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  const handleEditClick = (todo: Todo) => {
    let deadlineStr = "";
    if (todo.deadline) {
      const date = new Date(todo.deadline);
      // Bù trừ múi giờ để toISOString trả về đúng giờ địa phương
      const offset = date.getTimezoneOffset() * 60000; // lấy chênh lệch phút chuyển sang ms
      deadlineStr = new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 16);
    }

    setEditingTodo(todo);
    setEditForm({
      title: todo.title,
      description: todo.description || "",
      priority: todo.priority || "medium",
      deadline: deadlineStr,
      tags: todo.tags?.map((t) => t.id) || [], // Use optional chaining and nullish coalescing
    });
    setIsEditModalOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addForm.title.trim()) {
      toast.error("Tiêu đề công việc không được để trống!");
      return;
    }

    if (addForm.tags?.length === 0) {
      toast.error(
        "Vui lòng chọn ít nhất một thẻ tương ứng với công việc của bạn!",
      );
      return;
    }

    if (!addForm.deadline) {
      toast.error("Vui lòng chọn hạn chót cho công việc!");
      return;
    }

    const deadlineDate = new Date(addForm.deadline);
    if (deadlineDate <= new Date()) {
      toast.error(
        "Hạn chót (ngày và giờ) không được sớm hơn thời điểm hiện tại!",
      );
      return;
    }

    try {
      const newTodo = await todoService.postCreateOneTask(addForm);
      setTodos((prev) => [newTodo, ...prev]);
      toast.success("Thêm công việc thành công!");
      setIsAddModalOpen(false);
      // Reset form sau khi thêm thành công
      setAddForm({
        title: "",
        description: "",
        priority: "medium",
        deadline: "",
        tags: [],
      });
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Thêm công việc thất bại!");
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTodo) return;

    if (!editForm.title.trim()) {
      toast.error("Tiêu đề công việc không được để trống!");
      return;
    }

    if (editForm.tags?.length === 0) {
      toast.error(
        "Vui lòng chọn ít nhất một thẻ tương ứng với công việc của bạn!",
      );
      return;
    }

    if (editForm.deadline) {
      const deadlineDate = new Date(editForm.deadline);
      const createdAtDate = new Date(editingTodo.created_at);
      if (deadlineDate < createdAtDate) {
        toast.error(
          "Hạn chót (ngày và giờ) không được sớm hơn thời điểm tạo công việc!",
        );
        return;
      } else if (deadlineDate <= new Date()) {
        toast.error(
          "Hạn chót (ngày và giờ) không được sớm hơn thời điểm hiện tại!",
        );
        return;
      }
    }

    try {
      const updatedTodo = await todoService.updateTask({
        id: editingTodo.id,
        data: editForm,
      });
      setTodos((prev) =>
        prev.map((t) => (t.id === editingTodo.id ? updatedTodo : t)),
      );
      toast.success("Cập nhật công việc thành công!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.log(error);
      toast.error("Cập nhật thất bại!");
    }
  };

  // delete todo
  const deleteTodo = (id: number) => {
    setSelectedTodoId(id);
    setIsDeleteModalOpen(true);
  };

  // filter logic
  const priorityMap: Record<string, number> = { low: 1, medium: 2, high: 3 };

  const filteredTodos = todos
    .filter((todo) => {
      if (filter === "active") return todo.status === "todo";
      if (filter === "completed") return todo.status === "done";
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return (
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        case "priority-asc": {
          const pDiff = priorityMap[a.priority] - priorityMap[b.priority];
          if (pDiff !== 0) return pDiff;
          // Nếu cùng độ ưu tiên, cái nào mới hơn (created_at lớn hơn) thì lên trước
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        case "priority-desc": {
          const pDiff = priorityMap[b.priority] - priorityMap[a.priority];
          if (pDiff !== 0) return pDiff;
          // Nếu cùng độ ưu tiên, cái nào mới hơn (created_at lớn hơn) thì lên trước
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        }
        case "newest":
        default:
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
      }
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "low":
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "";
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">
            Bộ lọc
          </h2>

          {/* Filter by Tags */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
              Thẻ (Tags)
            </h4>
            <div className="space-y-2">
              {(availableTags || []).map((tag) => (
                <label
                  key={tag.id}
                  className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 accent-blue-600"
                  />
                  {tag.name}
                </label>
              ))}
            </div>
          </div>

          {/* Filter by Priority */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3">
              Độ ưu tiên
            </h4>
            <div className="space-y-2">
              {[
                { label: "Thấp", value: "low" },
                { label: "Trung bình", value: "medium" },
                { label: "Cao", value: "high" },
              ].map((p) => (
                <label
                  key={p.value}
                  className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 accent-blue-600"
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Tasks
          </h1>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm active:scale-95"
          >
            + Add Task
          </button>
        </div>

        {/* Status Filter & Sort */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              All
            </button>

            <button
              onClick={() => setFilter("active")}
              className={`px-3 py-1 rounded ${
                filter === "active"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              Active
            </button>

            <button
              onClick={() => setFilter("completed")}
              className={`px-3 py-1 rounded ${
                filter === "completed"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              Completed
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-gray-700 dark:text-gray-300">
              Sắp xếp:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm cursor-pointer shadow-sm"
            >
              <option value="newest">Mới nhất (Ngày tạo)</option>
              <option value="oldest">Cũ nhất (Ngày tạo)</option>
              <option value="priority-desc">Ưu tiên: Cao - Thấp</option>
              <option value="priority-asc">Ưu tiên: Thấp - Cao</option>
            </select>
          </div>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {loading && (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {!loading && filteredTodos.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
          )}

          {!loading &&
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className="flex flex-col p-4 bg-white dark:bg-gray-800 shadow rounded-xl border dark:border-gray-700 transition-all duration-200 hover:shadow-md"
              >
                {/* Top row: Title and Actions */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={todo.status === "done"}
                      onChange={() => toggleTodo(todo.id)}
                      className="w-5 h-5 cursor-pointer accent-blue-600 rounded mt-1"
                    />
                    <div>
                      <h3
                        className={`text-lg font-semibold ${
                          todo.status === "done"
                            ? "line-through text-gray-400 dark:text-gray-500"
                            : "text-gray-800 dark:text-gray-100"
                        }`}
                      >
                        {todo.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    {todo.status !== "done" && (
                      <button
                        onClick={() => handleEditClick(todo)}
                        className="text-gray-400 hover:text-blue-500 transition-colors p-1"
                        title="Chỉnh sửa"
                      >
                        <FaEdit size={17} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Xóa"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {todo.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-8 mb-3">
                    {todo.description}
                  </p>
                )}

                {/* Tags */}
                {todo.tags && todo.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 ml-8 mb-3">
                    {todo.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-purple-50 text-purple-600 border border-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800"
                      >
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom row: Meta Info */}
                <div className="flex flex-wrap items-center gap-3 ml-8 text-xs font-medium mt-auto pt-2 border-t border-gray-100 dark:border-gray-700">
                  {/* Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full border ${
                      todo.status === "done"
                        ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                    }`}
                  >
                    {todo.status.toUpperCase()}
                  </span>

                  {/* Priority Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full border ${getPriorityColor(todo.priority)}`}
                  >
                    {todo.priority.toUpperCase()}
                  </span>

                  {/* Timestamps */}
                  <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaClock size={10} />
                      {new Date(todo.created_at).toLocaleString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </span>

                    {todo.deadline && (
                      <span
                        className={`flex items-center gap-1 ${
                          new Date(todo.deadline) < new Date() &&
                          todo.status !== "done"
                            ? "text-red-500 font-bold"
                            : ""
                        }`}
                      >
                        <FaCalendarAlt size={10} />
                        {new Date(todo.deadline).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Modal Thêm Mới Task */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 border dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Thêm công việc mới
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setAddForm({
                    title: "",
                    description: "",
                    priority: "medium",
                    deadline: "",
                    tags: [],
                  });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Học vibe coding thật vui..."
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={addForm.title}
                  onChange={(e) =>
                    setAddForm({ ...addForm, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  placeholder="Chi tiết công việc cần làm..."
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  value={addForm.description}
                  onChange={(e) =>
                    setAddForm({ ...addForm, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thẻ (Tags)
                </label>
                <div className="flex flex-wrap gap-2">
                  {(availableTags || []).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        const currentTags = addForm.tags || [];
                        const newTags = currentTags.includes(tag.id) // currentTags is now number[]
                          ? currentTags.filter((id: number) => id !== tag.id)
                          : [...currentTags, tag.id];
                        setAddForm((prev) => ({ ...prev, tags: newTags }));
                      }}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        (addForm.tags || []).includes(tag.id)
                          ? "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700"
                          : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Độ ưu tiên
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={addForm.priority}
                    onChange={(e) =>
                      setAddForm({
                        ...addForm,
                        priority: e.target.value as "low" | "medium" | "high",
                      })
                    }
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hạn chót
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={addForm.deadline}
                    onChange={(e) =>
                      setAddForm({ ...addForm, deadline: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setAddForm({
                      title: "",
                      description: "",
                      priority: "medium",
                      deadline: "",
                      tags: [],
                    });
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Thêm mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Chỉnh sửa Task */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 border dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Chỉnh sửa công việc
              </h2>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  // required
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm({ ...editForm, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thẻ (Tags)
                </label>
                <div className="flex flex-wrap gap-2">
                  {(availableTags || []).map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        const currentTags = editForm.tags || [];
                        const newTags = currentTags.includes(tag.id) // currentTags is now number[]
                          ? currentTags.filter((id) => id !== tag.id)
                          : [...currentTags, tag.id];
                        setEditForm({ ...editForm, tags: newTags });
                      }}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        (editForm.tags || []).includes(tag.id)
                          ? "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-700"
                          : "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Độ ưu tiên
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editForm.priority}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        priority: e.target.value as "low" | "medium" | "high",
                      })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hạn chót
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={editForm.deadline}
                    onChange={(e) =>
                      setEditForm({ ...editForm, deadline: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa công việc này không?"
        onConfirm={confirmDeleteAction}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setSelectedTodoId(null);
        }}
      />
    </div>
  );
}
