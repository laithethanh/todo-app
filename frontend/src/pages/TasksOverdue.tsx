import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import todoService from "../services/todoService";
import { TodoResponse as Todo } from "../types";
import {
  FaClock,
  FaCalendarAlt,
  FaArrowLeft,
  FaExclamationCircle,
  FaInbox,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useClock } from "../hooks/useClock";
import TodoDeadlineBadge from "../components/common/TodoDeadlineBadge";
import ReactPaginate from "react-paginate";

export default function TasksOverdue() {
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 3; // Số lượng task trên mỗi trang

  const navigate = useNavigate();
  const { now } = useClock();

  useEffect(() => {
    const fetchAllTasks = async () => {
      try {
        setLoading(true);
        const res = await todoService.getAllTasksOverdue();
        setTasks(res || []);
      } catch (error) {
        console.error("Failed to fetch overdue tasks:", error);
        toast.error("Không thể tải danh sách công việc quá hạn");
      } finally {
        setLoading(false);
      }
    };
    fetchAllTasks();
  }, []);

  // Logic phân trang tại Frontend
  const offset = currentPage * itemsPerPage;
  const currentTasks = tasks.slice(offset, offset + itemsPerPage);
  const pageCount = Math.ceil(tasks.length / itemsPerPage);

  const handlePageClick = (event: { selected: number }) => {
    setCurrentPage(event.selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors mb-2 group font-medium"
          >
            <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
            Quay lại
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-3">
            <FaExclamationCircle className="text-red-500 animate-pulse" />
            Công việc quá hạn
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Bạn có {tasks.length} công việc cần xử lý ngay lập tức.
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-dashed dark:border-gray-700">
          <FaInbox className="mx-auto text-gray-300 dark:text-gray-600 text-6xl mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            Tuyệt vời! Không có công việc nào bị quá hạn.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {currentTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => navigate(`/auth/todos/${task.id}/deadline`)}
              className="group bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden border dark:border-gray-700 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              <div
                className={`h-2 bg-gradient-to-r ${task.priority === "high" ? "from-red-600 to-red-400" : task.priority === "medium" ? "from-yellow-500 to-orange-400" : "from-blue-500 to-indigo-400"}`}
              />

              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getPriorityStyles(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border bg-red-100 text-red-700 border-red-200">
                      OVERDUE
                    </span>
                  </div>
                  {task.deadline && (
                    <TodoDeadlineBadge deadline={task.deadline} now={now} />
                  )}
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-red-500 transition-colors">
                  {task.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 line-clamp-2 mb-6">
                  {task.description || "Không có mô tả cho công việc này."}
                </p>

                <div className="flex flex-wrap items-center gap-6 pt-4 border-t dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaClock className="text-blue-500" />
                    <span>
                      Ngày tạo:{" "}
                      {new Date(task.created_at).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-red-500">
                    <FaCalendarAlt />
                    <span>
                      Hạn chót:{" "}
                      {task.deadline
                        ? new Date(task.deadline).toLocaleString("vi-VN")
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination & Summary */}
          <div className="flex flex-col md:flex-row items-center justify-between mt-10 gap-4 border-t dark:border-gray-700 pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Hiển thị{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {currentTasks.length}
              </span>{" "}
              trong số{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {tasks.length}
              </span>{" "}
              kết quả
            </p>

            {pageCount > 1 && (
              <div className="flex justify-center">
                <ReactPaginate
                  breakLabel="..."
                  nextLabel="Sau >"
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={3}
                  pageCount={pageCount}
                  previousLabel="< Trước"
                  containerClassName="flex items-center gap-2"
                  pageClassName="rounded-xl border dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 shadow-sm"
                  pageLinkClassName="px-4 py-2 block text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
                  activeClassName="!bg-red-600 !border-red-600"
                  activeLinkClassName="!text-white"
                  previousClassName="rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
                  previousLinkClassName="px-4 py-2 block text-gray-700 dark:text-gray-300 hover:text-red-600"
                  nextClassName="rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
                  nextLinkClassName="px-4 py-2 block text-gray-700 dark:text-gray-300 hover:text-red-600"
                  disabledClassName="opacity-40 cursor-not-allowed"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
