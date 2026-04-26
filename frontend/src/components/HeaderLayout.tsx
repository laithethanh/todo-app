import { useState } from "react";
import { Outlet } from "react-router-dom";

export default function HeaderLayout() {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);

    // demo đơn giản (sau này bạn có thể nâng cấp bằng context)
    document.documentElement.classList.toggle("dark");
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
          {/* Add Task Button */}
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
            + Add Task
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {darkMode ? "🌙" : "☀️"}
          </button>

          {/* Profile Icon */}
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-400 transition">
            👤
          </div>
        </div>
      </header>
      <Outlet />
    </>
  );
}
