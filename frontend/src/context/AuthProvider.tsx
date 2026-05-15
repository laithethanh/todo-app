import { useState, useEffect, ReactNode } from "react";
import { AxiosError } from "axios";
import {
  LoginRequest,
  LoginResponse,
  RegisterResponse,
  User,
  RegisterRequest,
} from "../types";
import { setAuthToken } from "../services/api";
import { authService } from "../services/authService";
import { AuthContext } from "./authContext";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("token"),
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Đảm bảo header Authorization của axios được thiết lập nếu có token còn hạn
    if (token) {
      setAuthToken(token);
      try {
        const decode: User = jwtDecode(token);
        // Kiểm tra: Nếu thời gian hết hạn (exp * 1000) lớn hơn thời gian hiện tại
        if (decode.exp * 1000 > Date.now()) {
          setUser(decode); // Token còn hạn, trả về user
        } else {
          toast.warn(
            "Phiên đăng nhập của bạn đã kết thúc. Vui lòng đăng nhập lại.",
          );
          localStorage.removeItem("token");
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }
  }, [token]);

  const Login = async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await authService.login(data);
      setToken(response.token);
      setUser(response.user);
      setAuthToken(response.token); // Đồng bộ token vào localStorage và axios headers
      toast.success("Đăng nhập thành công!");
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại!",
      );
      throw error;
    }
  };

  const Logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
    setAuthToken(null); // Xóa token khỏi localStorage và axios headers
  };

  const Register = async (data: RegisterRequest): Promise<RegisterResponse> => {
    try {
      const response = await authService.register(data);
      toast.success("Đăng ký thành công! Bạn có thể đăng nhập ngay.");
      return response;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          "Đăng ký thất bại. Tên người dùng có thể đã tồn tại.",
      );
      throw error;
    }
  };

  const CheckAuth = (): boolean => {
    const isAuthenticated = authService.checkAuth();

    return isAuthenticated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login: Login,
        logout: Logout,
        register: Register,
        checkAuth: CheckAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
