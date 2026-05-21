import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import todoService from "../services/todoService";
import { TodoResponse as Todo } from "../types";
import {
  FaClock,
  FaCalendarAlt,
  FaArrowLeft,
  FaExclamationTriangle,
  FaCheckCircle,
  FaTag,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useClock } from "../hooks/useClock";
import TodoDeadlineBadge from "../components/common/TodoDeadlineBadge";

export default function OneTaskDeadline() {
  const [task, setTask] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { now } = useClock();

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await todoService.getOneTaskById(Number(id));
        setTask(res);
      } catch (error) {
        console.error("Failed to fetch task:", error);
        toast.error("Không thể tải thông tin công việc!", { toastId: "Error" });
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id]);

  const handleMarkDone = async () => {
    if (!task) return;
    try {
      const updatedTask = await todoService.updateTaskStatus({
        id: task.id,
        status: "done",
      });
      setTask(updatedTask);
      toast.success("Chúc mừng bạn đã hoàn thành công việc!");
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Không thể cập nhật trạng thái công việc!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 text-center bg-white dark:bg-gray-800 rounded-2xl shadow-lg border dark:border-gray-700">
        <FaExclamationTriangle className="mx-auto text-yellow-500 text-5xl mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Không tìm thấy công việc
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Công việc bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </p>
        <button
          onClick={() => navigate("/auth/todos")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-gray-200";
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group font-medium"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Quay lại
          </button>

          {task.status !== "done" && (
            <button
              onClick={handleMarkDone}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-1.5 rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-500/20 active:scale-95 text-sm font-bold"
            >
              <FaCheckCircle /> Mark done
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border dark:border-gray-700">
        {/* Accent Top Bar */}
        <div
          className={`h-3 bg-gradient-to-r ${task.priority === "high" ? "from-red-500 to-orange-500" : task.priority === "medium" ? "from-yellow-400 to-orange-400" : "from-blue-400 to-indigo-400"}`}
        />

        <div className="p-8 md:p-12">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getPriorityStyles(task.priority)}`}
            >
              {task.priority} Priority
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${task.status === "done" ? "bg-green-100 text-green-700 border-green-200" : "bg-blue-100 text-blue-700 border-blue-200"}`}
            >
              {task.status}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
            {task.title}
          </h1>

          {task.description && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">
                Mô tả chi tiết
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {task.tags && task.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <FaTag size={12} /> Thẻ phân loại
              </h3>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="px-4 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-xl text-sm font-medium border border-purple-100 dark:border-purple-800"
                  >
                    #{tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t dark:border-gray-700 mt-4">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                <FaClock className="text-blue-600 dark:text-blue-400 text-2xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tighter">
                  Ngày tạo
                </p>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {new Date(task.created_at).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>

            {task.deadline && (
              <div className="flex items-center gap-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                  <FaCalendarAlt className="text-orange-600 dark:text-orange-400 text-2xl" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-tighter">
                      Hạn chót
                    </p>
                    {task.status !== "done" && (
                      <TodoDeadlineBadge deadline={task.deadline} now={now} />
                    )}
                  </div>
                  <p
                    className={`font-semibold ${new Date(task.deadline) < now && task.status !== "done" ? "text-red-500" : "text-gray-900 dark:text-white"}`}
                  >
                    {new Date(task.deadline).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
