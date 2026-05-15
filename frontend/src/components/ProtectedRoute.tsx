import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user } = useAuth();

  // if (!checkAuth()) {
  //   return <Navigate to="/login" replace />;
  // }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
