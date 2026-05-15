import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import ConfirmModal from "./ConfirmModal";

export default function HeaderLayout() {
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);

    // demo đơn giản (sau này bạn có thể nâng cấp bằng context)
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    setShowProfileMenu(false); // Đóng menu profile dropdown
    setIsLogoutModalOpen(true); // Mở modal xác nhận
  };

  const confirmLogoutAction = () => {
    logout();
    navigate("/login");
    setIsLogoutModalOpen(false);
  };

  return (
    <>
      <header className="w-full bg-white dark:bg-gray-900 shadow-md px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-xl font-bold text-blue-600">TodoApp</div>

        {/* Search */}
        <div className="flex-1 mx-6">
          <input
            type="text"
            placeholder="Search tasks..."
            className="w-full px-4 py-2 border rounded-lg 
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Add Search Button */}
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            Search
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? "🌙" : "☀️"}
          </button>

          {/* Profile Icon */}
          <div className="relative">
            <div
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-400 transition"
            >
              👤
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
                    {user?.username || "User"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <Outlet />

      <ConfirmModal
        isOpen={isLogoutModalOpen}
        title="Xác nhận đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?"
        onConfirm={confirmLogoutAction}
        onCancel={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
