import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await login({ username, password });
      // Nếu login thành công (không throw error), chuyển hướng người dùng
      navigate("/auth/todos");
    } catch (error) {
      // Lỗi đã được xử lý hiển thị toast thông báo trong AuthProvider
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-full max-w-md border dark:border-gray-700">
        {/* Title */}
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">
          Login
        </h2>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="Enter your username"
              autoComplete="username"
              className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              className="w-full px-4 py-2 border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Login
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
