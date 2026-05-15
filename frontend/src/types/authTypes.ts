export interface User {
  id: number;
  username: string;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterResponse {
  user: User;
}

export interface AuthContextType {
  darkMode: string;
  setDarkMode: React.Dispatch<React.SetStateAction<string>>;
  user: User | null;
  token: string | null;
  login: (data: LoginRequest) => Promise<LoginResponse>;
  logout: () => void;
  register: (data: RegisterRequest) => Promise<RegisterResponse>;
  checkAuth: () => boolean;
}
