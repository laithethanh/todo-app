import { jwtDecode } from "jwt-decode";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types";
import api, { setAuthToken } from "./api";

interface JwtPayload {
  exp?: number;
}

const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    if (!decoded.exp) return true;
    return decoded.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>("/auth/login", data);
    setAuthToken(res.data.token);
    return res.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const res = await api.post<RegisterResponse>("/auth/register", data);
    return res.data;
  },

  logout: (): void => {
    setAuthToken(null);
  },

  checkAuth: (): boolean => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    if (isTokenExpired(token)) {
      setAuthToken(null);
      return false;
    }

    return true;
  },
};

export default authService;
