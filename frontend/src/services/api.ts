import axios, { AxiosError } from "axios";
import { toast } from "react-toastify";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api";

const TOKEN_KEY = "token";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  // không cần bật nếu chỉ truyền vào header Authorization, bật khi cần gửi cookie
  // withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Kiểm tra xem request bị lỗi có phải là request đăng nhập hay không
    // Chúng ta không muốn hiển thị "Phiên đăng nhập hết hạn" khi người dùng nhập sai mật khẩu
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    if (error.response?.status === 401 && !isLoginRequest) {
      localStorage.removeItem(TOKEN_KEY);
      // Buộc trình duyệt tải lại và điều hướng về login để xóa sạch React State
      toast.warn(
        "Phiên đăng nhập của bạn đã kết thúc. Vui lòng đăng nhập lại để tiếp tục.",
      );
      // Trì hoãn việc chuyển trang 5 giây để người dùng kịp đọc thông báo
      setTimeout(() => {
        window.location.href = "/login";
      }, 5000);
    }

    return Promise.reject(error);
  },
);

export const setAuthToken = (token: string | null) => {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export default api;
