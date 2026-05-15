import { useState, useEffect, ReactNode } from "react";
import { AxiosError } from "axios";
import {
  LoginRequest,
  LoginResponse,
  RegisterResponse,
  User,
  RegisterRequest,
} from "../types";
import { authService } from "../services/authService";
import { AuthContext } from "./authContext";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      const decode: User = jwtDecode(storedToken);
      setUser(decode);
    }
  }, []);

  const Login = async (data: LoginRequest): Promise<LoginResponse> => {
    try {
      const response = await authService.login(data);
      setToken(response.token);
      setUser(response.user);
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
